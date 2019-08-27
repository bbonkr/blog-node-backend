/**
 * 포스트
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const Sequelize = require('sequelize');
const showdown = require('showdown');
const xssFilter = require('showdown-xss-filter');
const { isLoggedIn } = require('./middleware');
const Op = Sequelize.Op;
const { makeSlug } = require('../helpers/stringHelper');
const {
    markdownConverter,
    stripHtml,
    getExcerpt,
    defaultUserAttributes,
} = require('./helper');
const EXCERPT_LENGTH = 200;

// const markdownConverter = new showdown.Converter(
//     {
//         omitExtraWLInCodeBlocks: false,
//         noHeaderId: false,
//         ghCompatibleHeaderId: true,
//         prefixHeaderId: true,
//         headerLevelStart: 1,
//         parseImgDimensions: true,
//         simplifiedAutoLink: true,
//         excludeTrailingPunctuationFromURLs: true,
//         literalMidWordUnderscores: true,
//         strikethrough: true,
//         tables: true,
//         tasklists: true,
//         ghMentions: false,
//         ghMentionsLink: false,
//         ghCodeBlocks: true,
//         smartIndentationFix: true,
//         smoothLivePreview: true,
//         disableForced4SpacesIndentedSublists: true,
//         simpleLineBreaks: true,
//         requireSpaceBeforeHeadingText: true,
//         encodeEmails: true,
//     },
//     {
//         extensions: [xssFilter],
//     },
// );

// const stripHtml = html => {
//     return html.replace(/(<([^>]+)>)/gi, '');
// };

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const {
            title,
            slug,
            markdown,
            coverImage,
            categories,
            tags,
        } = req.body;

        const html = markdownConverter.makeHtml(markdown);
        const text = stripHtml(html);
        const slugEdit = !!slug
            ? slug
            : title.replace(/\s+/g, '-').toLowerCase();

        const checkPost = await db.Post.findOne({
            where: { slug: slug, UserId: req.user.id },
        });
        if (!!checkPost) {
            // 동일한 슬러그를 사용할 수 없습니다.
            return res
                .status(400)
                .send(`The [${slug}] post is exists already.`);
        }

        const post = await db.Post.create({
            title: title,
            slug: slugEdit,
            markdown: markdown,
            html: html,
            text: text,
            excerpt: getExcerpt(text),
            coverImage: coverImage,
            UserId: req.user.id,
        });

        if (categories) {
            const foundCategories = await Promise.all(
                categories.map(v => {
                    return db.Category.findOne({ where: { slug: v.slug } });
                }),
            );

            // await Promise.all(
            //     foundCategories.forEach(v => {
            //         return db.Category.addPost(post);
            //     }),
            // );

            await post.addCategories(foundCategories);
        }

        if (tags) {
            const foundTags = await Promise.all(
                tags.map(v => {
                    const slug = makeSlug(v.name);
                    return db.Tag.findOrCreate({
                        where: { slug: v.slug },
                        defaults: {
                            name: v.name,
                            slug: slug,
                        },
                    });
                }),
            );

            await post.addTags(
                foundTags.map(v => {
                    // console.log('tag findOrCreate: ', v);
                    return v[0];
                }),
            );
            // await Promise.all(
            //     foundTags.forEach(v => {
            //         return db.Tag.addPost(post);
            //     }),
            // );
        }

        const newPost = await db.Post.findOne({
            where: {
                id: post.id,
            },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
                {
                    model: db.Tag,
                    as: 'Tags',
                    through: 'PostTag',
                },
                {
                    model: db.Category,
                    as: 'Categories',
                    through: 'PostCategory',
                },
                {
                    model: db.PostAccessLog,
                    attributes: ['id'],
                },
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'title',
                'slug',
                'html',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        return res.json(newPost);
    } catch (e) {
        next(e);
    }
});

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await db.Post.findOne({
            where: { id: id, UserId: req.user.id },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
                {
                    model: db.Tag,
                    as: 'Tags',
                    through: 'PostTag',
                },
                {
                    model: db.Category,
                    as: 'Categories',
                    through: 'PostCategory',
                },
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
        });

        if (!post) {
            return res
                .status(404)
                .send('Could not find a post. The post may not be yours.');
        }

        const {
            title,
            slug,
            markdown,
            coverImage,
            categories,
            tags,
        } = req.body;

        const html = markdownConverter.makeHtml(markdown);
        const text = stripHtml(html);
        const slugEdit = !!slug
            ? slug
            : title.replace(/\s+/g, '-').toLowerCase();

        const checkPost = await db.Post.findOne({
            where: {
                slug: slug,
                UserId: req.user.id,
                id: { [Op.ne]: post.id },
            },
            attributes: ['id'],
        });

        if (!!checkPost) {
            // 동일한 슬러그를 사용할 수 없습니다.
            return res
                .status(400)
                .send(`The [${slug}] post is exists already.`);
        }

        await post.update(
            {
                title: title,
                slug: slugEdit,
                markdown: markdown,
                html: html,
                text: text,
                excerpt: getExcerpt(text),
                coverImage: coverImage,
            },
            {
                fields: [
                    'title',
                    'slug',
                    'markdown',
                    'html',
                    'text',
                    'excerpt',
                    'coverImage',
                ],
            },
        );

        if (!!post.Categories) {
            await post.removeCategories(post.Categories.map(c => c.id));
        }

        if (!!post.Tags) {
            await post.removeTags(post.Tags.map(t => t.id));
        }

        if (categories) {
            const foundCategories = await Promise.all(
                categories.map(v => {
                    return db.Category.findOne({ where: { slug: v.slug } });
                }),
            );

            // await Promise.all(
            //     foundCategories.forEach(v => {
            //         return db.Category.addPost(post);
            //     }),
            // );
            // console.log('foundCategories: ', foundCategories);

            await post.addCategories(foundCategories);
        }

        if (tags) {
            const foundTags = await Promise.all(
                tags.map(v => {
                    const slug = makeSlug(v.name);
                    return db.Tag.findOrCreate({
                        where: { slug: v.slug },
                        defaults: {
                            name: v.name,
                            slug: slug,
                        },
                    });
                }),
            );

            // console.log('foundTags: ', foundTags);

            await post.addTags(
                foundTags.map(v => {
                    // console.log('tag findOrCreate: ', v);
                    return v[0];
                }),
            );
            // await Promise.all(
            //     foundTags.forEach(v => {
            //         return db.Tag.addPost(post);
            //     }),
            // );
        }

        const changedPost = await db.Post.findOne({
            where: {
                id: post.id,
            },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
                {
                    model: db.Tag,
                    as: 'Tags',
                    through: 'PostTag',
                },
                {
                    model: db.Category,
                    as: 'Categories',
                    through: 'PostCategory',
                },
                {
                    model: db.PostAccessLog,
                    attributes: ['id'],
                },
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'title',
                'slug',
                'html',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        return res.json(changedPost);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10) || -1;
        const post = await db.Post.findOne({
            where: { id: id, UserId: req.user.id },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
                {
                    model: db.Tag,
                    as: 'Tags',
                    through: 'PostTag',
                },
                {
                    model: db.Category,
                    as: 'Categories',
                    through: 'PostCategory',
                },
                {
                    model: db.PostAccessLog,
                    attributes: ['id'],
                },
                {
                    model: db.Image,
                    through: 'PostImage',
                    as: 'Images',
                    attributes: [
                        'id',
                        'src',
                        'size',
                        'fileName',
                        'fileExtension',
                        'contentType',
                    ],
                },
                {
                    model: db.Comment,
                },
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            attributes: ['id', 'title', 'slug', 'UserId'],
        });

        if (!post) {
            return res.status(404).send('Could not find a post');
        }
        if (post.Categories && post.Categories.length > 0) {
            await post.removeCategories(post.Categories.map(x => x.id));
        }
        if (post.PostAccessLogs && post.PostAccessLogs.length > 0) {
            await post.removePostAccessLogs(post.PostAccessLogs.map(x => x.id));
        }
        if (post.Tags && post.Tags.length > 0) {
            await post.removeTags(post.Tags.map(x => x.id));
        }
        if (post.Comments && post.Comments.length > 0) {
            await post.removeComments(post.Comments.map(x => x.id));
        }
        if (post.Likers && post.Likers.length > 0) {
            await post.removeLikers(post.Likers.map(x => x.id));
        }
        // await post.User.removePost(post.id);

        await post.destroy();

        return res.json({ id: id });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
