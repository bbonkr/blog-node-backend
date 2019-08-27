const router = require('express').Router();
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const db = require('../models');
const { isLoggedIn } = require('./middleware');
const {
    findUserById,
    normalizeUsername,
    tryParseInt,
    defaultUserAttributes,
} = require('./helper');

const Op = Sequelize.Op;

/**
 * 사용자의 글 목록을 가져옵니다.
 * GET:/api/users/:user/posts?pageToken={pageToken}&limit={limit}&keyword={keyword}
 */
router.get('/:user/posts', async (req, res, next) => {
    try {
        /** 사용자 username :==> @userName */
        const user = decodeURIComponent(req.params.user);
        const limit = tryParseInt(req.query.limit, 10, 10);
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken = tryParseInt(req.query.pageToken, 10, -1);
        const skip = pageToken ? 1 : 0;

        const username = normalizeUsername(user);

        const foundUser = await db.User.findOne({
            where: { username: username },
            attributes: ['id'],
        });

        if (!foundUser) {
            return res.status(404).send(`Could not find user [${user}]`);
        }

        let where = { UserId: foundUser.id };
        if (pageToken) {
            const basisPost = await db.Post.findOne({
                where: {
                    id: pageToken,
                },
            });

            if (basisPost) {
                Object.assign(where, {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                });
            }
        }

        if (keyword) {
            Object.assign(where, {
                [Op.or]: [
                    { title: { [Op.like]: `%${keyword}%` } },
                    {
                        text: {
                            [Op.like]: `%${keyword}%`,
                        },
                    },
                ],
            });
        }

        const posts = await db.Post.findAll({
            where: where,
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
            limit: limit,
            skip: skip,
            attributes: [
                'id',
                'title',
                'slug',
                'excerpt',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        return res.json(posts);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/** 사용자의 글을 가져옵니다.
 * GET:/api/users/:user/posts/:post
 */
router.get('/:user/posts/:post', async (req, res, next) => {
    try {
        /** 사용자 username :==> @userName */
        const user = decodeURIComponent(req.params.user);
        const slug = decodeURIComponent(req.params.post);

        if (!user) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }

        if (!slug) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }
        const username = normalizeUsername(user);

        const foundUser = await db.User.findOne({
            where: { username: username },
            attributes: ['id'],
        });

        if (!foundUser) {
            return res.status(404).send(`Could not find user [@${user}]`);
        }

        const post = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                    where: {
                        id: foundUser.id,
                    },
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
                'excerpt',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        if (post) {
            const log = await db.PostAccessLog.create({
                ipAddress: req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                userId: req.user && req.user.id,
            });

            await post.addPostAccessLog(log);

            return res.json(post);
        } else {
            return res.status(404).send('페이지를 찾을 수 없습니다.');
        }
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/:user/categories', async (req, res, next) => {});

router.get('/:user/categories/:category/posts', async (req, res, next) => {
    try {
        /** 사용자 username :==> @userName */
        const user = decodeURIComponent(req.params.user);
        const category = decodeURIComponent(req.params.category);
        const limit = tryParseInt(req.query.limit, 10, 10);
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken = tryParseInt(req.query.pageToken, 10, -1);
        const skip = pageToken ? 1 : 0;

        const username = normalizeUsername(user);

        const foundUser = await db.User.findOne({
            where: { username: username },
            attributes: defaultUserAttributes,
        });

        if (!foundUser) {
            return res.status(404).send(`Could not find user [${user}]`);
        }

        const foundCategory = await db.Category.findOne({
            where: {
                slug: category,
                userId: foundUser.id,
            },
        });

        if (!foundCategory) {
            return res
                .status(404)
                .send(`Could not find a category [${category}]`);
        }

        let where = { UserId: foundUser.id };

        if (keyword) {
            Object.assign(where, {
                [Op.or]: [
                    { title: { [Op.like]: `%${keyword}%` } },
                    {
                        text: {
                            [Op.like]: `%${keyword}%`,
                        },
                    },
                ],
            });
        }

        const { count, rows } = await db.Post.findAndCountAll({
            where: where,
            include: [
                {
                    model: db.Category,
                    as: 'Categories',
                    through: 'PostCategory',
                    where: {
                        slug: category,
                    },
                },
            ],
        });

        if (pageToken) {
            const basisPost = await db.Post.findOne({
                where: {
                    id: pageToken,
                },
            });

            if (basisPost) {
                Object.assign(where, {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                });
            }
        }

        Object.assign(where, {
            id: {
                [Op.in]: rows.map(r => r.id),
            },
        });

        const posts = await db.Post.findAll({
            where: where,
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
            limit: limit,
            skip: skip,
            attributes: [
                'id',
                'title',
                'slug',
                'excerpt',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        return res.json({
            records: posts,
            total: count,
            user: foundUser,
            category: foundCategory,
        });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/** 글 좋아요 */
router.post('/:user/posts/:post/like', isLoggedIn, async (req, res, next) => {
    try {
        /** 사용자 username :==> @userName */
        const user = decodeURIComponent(req.params.user);
        const slug = decodeURIComponent(req.params.post);

        if (!user) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }

        if (!slug) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }
        const username = normalizeUsername(user);

        const foundUser = await db.User.findOne({
            where: { username: username },
            attributes: ['id'],
        });

        if (!foundUser) {
            return res.status(404).send(`Could not find user [@${user}]`);
        }

        let post = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                },
            ],
        });

        if (!post) {
            return res.status(404).send(`Could not find a post. [${slug}]`);
        }

        const likerIndex = post.Likers.findIndex(x => x.id === req.user.id);
        if (likerIndex >= 0) {
            return res
                .status(400)
                .send('You marked to like this post already.');
        }

        await post.addLikers(req.user.id);

        post = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            attributes: ['id'],
        });

        return res.json(post);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/** 글 좋아요 취소 */
router.delete('/:user/posts/:post/like', isLoggedIn, async (req, res, next) => {
    try {
        /** 사용자 username :==> @userName */
        const user = decodeURIComponent(req.params.user);
        const slug = decodeURIComponent(req.params.post);

        if (!user) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }

        if (!slug) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }
        const username = normalizeUsername(user);

        const foundUser = await db.User.findOne({
            where: { username: username },
            attributes: ['id'],
        });

        if (!foundUser) {
            return res.status(404).send(`Could not find user [@${user}]`);
        }

        let post = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                },
            ],
        });

        if (!post) {
            return res.status(404).send(`Could not find a post. [${slug}]`);
        }

        const likerIndex = post.Likers.findIndex(x => x.id === req.user.id);
        if (likerIndex < 0) {
            return res.status(400).send('You did not mark to like this post.');
        }

        await post.removeLikers(req.user.id);

        post = await db.Post.findOne({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            attributes: ['id'],
        });

        return res.json(post);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

module.exports = router;
