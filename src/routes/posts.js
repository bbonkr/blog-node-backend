/**
 * 포스트
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const Sequelize = require('sequelize');
const { defaultUserAttributes } = require('./helper');
const Op = Sequelize.Op;

router.get('/', async (req, res, next) => {
    try {
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken =
            (req.query.pageToken && parseInt(req.query.pageToken)) || 0;
        const skip = pageToken ? 1 : 0;

        let where = {};

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

        const { count } = await db.Post.findAndCountAll({
            where: where,
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
            ],

            attributes: ['id', 'UserId'],
        });

        if (pageToken) {
            const basisPost = await db.Post.findOne({
                where: {
                    id: pageToken,
                },
            });

            if (basisPost) {
                where = {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                };
            }
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

        return res.json({ records: posts, total: count });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/category/:category', async (req, res, next) => {
    try {
        const { category } = req.params;
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken =
            (req.query.pageToken && parseInt(req.query.pageToken)) || 0;
        const skip = pageToken ? 1 : 0;

        let where = {};
        if (pageToken) {
            const basisPost = await db.Post.findOne({
                where: {
                    id: pageToken,
                },
            });

            if (basisPost) {
                where = {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                };
            }
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
                    where: {
                        slug: category,
                    },
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

router.get('/tag/:tag', async (req, res, next) => {
    try {
        const tag = req.params.tag && decodeURIComponent(req.params.tag);
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken =
            (req.query.pageToken && parseInt(req.query.pageToken)) || 0;
        const skip = pageToken ? 1 : 0;

        const tagRef = await db.Tag.findOne({
            where: { slug: tag },
        });

        if (!tagRef) {
            return res.status(404).send(`Could not find tag. [${tag}]`);
        }

        let where = {};
        if (pageToken) {
            const basisPost = await db.Post.findOne({
                where: {
                    id: pageToken,
                },
            });

            if (basisPost) {
                where = {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                };
            }
        }

        const { count, rows } = await db.Post.findAndCountAll({
            include: [
                {
                    model: db.Tag,
                    as: 'Tags',
                    through: 'PostTag',
                    where: {
                        id: tagRef.id,
                    },
                },
            ],
            attributes: ['id'],
        });

        Object.assign(where, {
            id: { [Op.in]: rows.map(r => r.id) },
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

        return res.json({ records: posts, total: count, tag: tagRef });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        if (!req.params.slug) {
            return res.status(401).send('유효한 요청이 아닙니다.');
        }

        const slug = decodeURIComponent(req.params.slug);
        const post = await db.Post.findOne({
            where: {
                slug: slug,
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

        if (post) {
            const log = await db.PostAccessLog.create({
                ipAddress: req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
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

module.exports = router;
