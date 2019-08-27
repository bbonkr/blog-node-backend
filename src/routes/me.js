const router = require('express').Router();
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const db = require('../models');
const { isLoggedIn } = require('./middleware');
const { findUserById, defaultUserAttributes } = require('./helper');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { replaceAll, makeSlug } = require('../helpers/stringHelper');
const { tryParseInt } = require('./helper');

const Op = Sequelize.Op;

const upload = multer({
    storage: multer.diskStorage({
        destination(req, res, done) {
            // 파일 저장 경로
            const mm = moment(Date.now()).format('MM');
            const yyyy = moment(Date.now()).format('YYYY');
            const dest = path.join('uploads', `${req.user.id}`, yyyy, mm);
            // console.log('destination directory: ', dest);

            // asynchronous
            // fs.exists(dest, exists => {
            //     if (!exists) {
            //         // asynchronous
            //         fs.mkdir(dest, { recursive: true }, err => {

            //             if (err) {
            //                 console.error(err);
            //             }

            //             done(err, dest);
            //         });

            //     }
            // });

            // synchronous
            const existsDir = fs.existsSync(dest);
            if (!existsDir) {
                fs.mkdirSync(dest, { recursive: true });
            }

            done(null, dest);
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            // 저장되는 파일이름
            done(null, `${basename}${new Date().valueOf()}${ext}`);
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
});

const normalizeCategoryOrder = async userId => {
    // normalize
    const categoriesSort = await db.Category.findAll({
        where: { UserId: userId },
        order: [['ordinal', 'ASC']],
    });

    if (categoriesSort) {
        await Promise.all(
            categoriesSort.map((v, i) => {
                return v.update({ ordinal: i + 1 });
            }),
        );
    }
};

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const me = await findUserById(req.user.id);

        if (me) {
            return res.json(me);
        } else {
            return res.status(404).send('Could not find my info.');
        }
    } catch (e) {
        // console.error(e);
        return next(e);
    }
});

router.get('/post/:id', isLoggedIn, async (req, res, next) => {
    try {
        const id = parseInt(req.params.id || '0', 10);

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
                    model: db.User,
                    through: 'UserLikePost',
                    as: 'Likers',
                    attributes: ['id'],
                },
            ],
            attributes: [
                'id',
                'title',
                'slug',
                'markdown',
                'coverImage',
                'UserId',
                'createdAt',
                'updatedAt',
            ],
        });

        if (!post) {
            return res.status(404).send('Could not find a post.');
        }

        return res.json(post);
    } catch (e) {
        // console.error(e);
        return next(e);
    }
});

/**
 * 나의 글 목록을 가져옵니다.
 * ```
 * query: {
 *      pageToken : string // 목록의 마지막 글의 식별자,
 *      limit: number // 가져올 글의 수,
 *      keyword: string // 검색어,
 * }
 * ```
 */
router.get('/posts', isLoggedIn, async (req, res, next) => {
    try {
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken =
            (req.query.pageToken && parseInt(req.query.pageToken)) || 0;
        const skip = pageToken ? 1 : 0;

        let where = { UserId: req.user.id };

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

        const postsCount = await db.Post.findAll({
            where: where,
            attributes: ['id'],
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
                // where = {
                //     createdAt: {
                //         [db.Sequelize.Op.lt]: basisPost.createdAt,
                //     },
                // };
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

        return res.json({ posts, postsCount: postsCount.length || 0 });
    } catch (e) {
        return next(e);
    }
});

/**
 * 파일 목록을 가져옵니다.
 */
router.get('/media', isLoggedIn, async (req, res, next) => {
    try {
        const { pageToken, keyword, limit } = req.query;
        const recordLimit = parseInt(limit, 10) || 10;
        const skip = pageToken ? 1 : 0;
        let where = { UserId: req.user.id };

        if (pageToken) {
            const id = parseInt(pageToken, 10);
            const latestImage = await db.Image.findOne({ where: { id: id } });
            if (latestImage) {
                Object.assign(where, {
                    id: {
                        [Op.lt]: latestImage.id,
                    },
                });
            }
        }

        if (keyword) {
            Object.assign(where, {
                fileName: {
                    [Op.like]: `%${keyword.trim()}%`,
                },
            });
        }

        const images = await db.Image.findAll({
            where: where,
            attributes: [
                'id',
                'src',
                'fileName',
                'fileExtension',
                'size',
                'contentType',
                'createdAt',
            ],
            order: [['createdAt', 'DESC']],
            limit: recordLimit,
            skip: skip,
        });

        return res.json(images);
    } catch (e) {
        return next(e);
    }
});

/**
 * 파일을 추가합니다.
 */
router.post(
    '/media',
    isLoggedIn,
    upload.array('files'),
    async (req, res, next) => {
        try {
            const images = await Promise.all(
                req.files.map(v => {
                    // console.log('file: ', v);

                    const filename = v.originalname;
                    const ext = path.extname(filename);
                    const basename = path.basename(filename, ext);

                    const savedFileExt = path.extname(v.path);
                    const savedFileBasename = encodeURIComponent(
                        path.basename(v.path, savedFileExt),
                    );
                    const savedFileDir = path.dirname(v.path);
                    const serverRootDir = path.normalize(
                        path.join(__dirname, '..'),
                    );
                    const savedFileRelativeDir = path.relative(
                        serverRootDir,
                        savedFileDir,
                    );

                    const src = `/${replaceAll(
                        savedFileRelativeDir,
                        '\\\\',
                        '/',
                    )}/${savedFileBasename}${savedFileExt}`;
                    // console.log('file src: ', src);

                    return db.Image.create({
                        src: src,
                        path: `${path.join(serverRootDir, v.path)}`,
                        fileName: basename,
                        fileExtension: ext,
                        size: v.size,
                        contentType: v.mimetype,
                        UserId: req.user.id,
                    });
                }),
            );

            // console.log('Promise.all ==> images', images);

            const addedImages = await db.Image.findAll({
                where: {
                    id: {
                        [Op.in]: images.map(v => v.id),
                    },
                },
                attributes: [
                    'id',
                    'src',
                    'fileName',
                    'fileExtension',
                    'size',
                    'contentType',
                    'createdAt',
                ],
            });

            return res.json(addedImages);
        } catch (e) {
            console.error(e);
            next(e);
        }
    },
);

router.delete('/media/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        // const deleteSrc = decodeURIComponent(src);

        const foundImage = await db.Image.findOne({
            where: {
                UserId: req.user.id,
                id: id,
            },
            attributes: [
                'id',
                'path',
                'src',
                'fileName',
                'fileExtension',
                'size',
                'contentType',
                'createdAt',
            ],
        });

        if (!foundImage) {
            return res.status(404).send('Could not find a file.');
        }

        if (fs.existsSync(foundImage.path)) {
            // 파일이 있는 경우만 삭제합니다.
            fs.unlinkSync(foundImage.path);
        }

        await foundImage.destroy();

        delete foundImage.path;

        return res.json(foundImage);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/**
 * 나의 분류를 가져옵니다.
 */
router.get('/categories', isLoggedIn, async (req, res, next) => {
    try {
        const { pageToken, limit, keyword } = req.query;
        // const skip = pageToken ? 1 : 0;
        let where = { UserId: req.user.id };

        if (keyword) {
            Object.assign(where, {
                name: {
                    [Op.like]: `%${decodeURIComponent(keyword)}%`,
                },
            });
        }

        const { count } = await db.Category.findAndCountAll({ where: where });

        if (!!pageToken) {
            const lastCategory = await db.Category.findOne({
                where: {
                    UserId: req.user.id,
                    id: tryParseInt(`${pageToken}`, 10, 0),
                },
            });
            if (!!lastCategory) {
                Object.assign(where, {
                    ordinal: {
                        [Op.gt]: lastCategory.ordinal,
                    },
                });
            }
        }

        const categories = await db.Category.findAll({
            where: where,
            include: [
                {
                    model: db.User,
                    // where: { id: req.user.id },
                    attributes: ['id'],
                },
                {
                    model: db.Post,
                    through: 'PostCategory',
                    as: 'Posts',
                    attributes: ['id'],
                },
            ],
            order: [['ordinal', 'ASC']],
            limit: limit && tryParseInt(limit, 10, 10),
            // skip: skip,
        });

        return res.json({
            items: categories,
            total: count,
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/**
 * 나의 분류를 추가합니다.
 */
router.post('/category', isLoggedIn, async (req, res, next) => {
    try {
        const { name, slug, ordinal } = req.body;
        const slugValue = slug || makeSlug(name);
        let ordinalValue = tryParseInt(`${ordinal}`, 10, 0);
        const duplicatedCategory = await db.Category.findOne({
            where: { slug: slugValue },
            include: [
                {
                    model: db.User,
                    where: { id: req.user.id },
                    attributes: ['id'],
                },
            ],
        });

        if (!!duplicatedCategory) {
            const message = `Duplicated item found. It may be '${
                duplicatedCategory.name
            }'.`;
            return res.status(400).send(message);
        }

        if (ordinalValue < 1) {
            const maxOridinal = await db.Category.max('ordinal', {
                include: [{ model: db.User, where: { id: req.user.id } }],
            });

            ordinalValue = maxOridinal || 1;
        }

        const addedCategory = await db.Category.create({
            name,
            slug: slugValue,
            ordinal: ordinalValue,
            UserId: req.user.id,
        });

        const adjustOridnal = await db.Category.findAll({
            where: {
                UserId: req.user.id,
                id: {
                    [Op.not]: addedCategory.id,
                },
                ordinal: {
                    [Op.gte]: addedCategory.ordinal,
                },
            },
        });

        if (adjustOridnal) {
            await Promise.all(
                adjustOridnal.map(v => {
                    return v.update({
                        ordinal: ordinal + 1,
                    });
                }),
            );
        }

        // normalize
        normalizeCategoryOrder(req.user.id);

        return res.json(addedCategory);
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.patch('/category/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id, name, slug, ordinal } = req.body;
        let ordinalValue = tryParseInt(`${ordinal}`, 10, 0);
        const foundCategory = await db.Category.findOne({
            where: { id: id },
            include: [{ model: db.User, where: { id: req.user.id } }],
        });

        if (!foundCategory) {
            return res.status(404).send('Could not find a category.');
        }

        const slugValue = slug || makeSlug(name);

        const duplicatedCategory = await db.Category.findOne({
            where: {
                slug: slugValue,
                id: {
                    [Op.not]: id,
                },
            },
            include: [
                {
                    model: db.User,
                    where: { id: req.user.id },
                    attributes: ['id'],
                },
            ],
        });

        if (!!duplicatedCategory) {
            const message = `Duplicated item found. It may be '${
                duplicatedCategory.name
            }'.`;
            return res.status(400).send(message);
        }

        if (ordinalValue < 1) {
            const maxOridinal = await db.Category.max('ordinal', {
                include: [{ model: db.User, where: { id: req.user.id } }],
            });

            ordinalValue = maxOridinal || 1;
        }

        await foundCategory.update({
            name: name,
            slug: slug || makeSlug(name),
            ordinal: ordinalValue,
        });

        const updatedCategory = await db.Category.findOne({
            where: { id: id },
            include: [
                {
                    model: db.User,
                    where: { id: req.user.id },
                },
                {
                    model: db.Post,
                    through: 'PostCategory',
                    as: 'Posts',
                    attributes: ['id'],
                },
            ],
        });

        const adjustOridnal = await db.Category.findAll({
            where: {
                UserId: req.user.id,
                id: {
                    [Op.not]: updatedCategory.id,
                },
                ordinal: {
                    [Op.gte]: updatedCategory.ordinal,
                },
            },
        });

        if (adjustOridnal) {
            await Promise.all(
                adjustOridnal.map(v => {
                    return v.update({
                        ordinal: ordinal + 1,
                    });
                }),
            );
        }

        // normalize
        normalizeCategoryOrder(req.user.id);
        // const categoriesSort = await db.Category.findAll({
        //     where: { UserId: req.user.id },
        //     order: [['ordinal', 'ASC']],
        // });

        // if (categoriesSort){
        //     await Promise.all(
        //         categoriesSort.map((v, i) => {
        //             return v.update({ ordinal: i + 1 });
        //         })
        //     );
        // }

        return res.json(updatedCategory);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.delete('/category/:id', isLoggedIn, async (req, res, next) => {
    try {
        const id = tryParseInt(req.params.id, 10, 0);

        const foundCategory = await db.Category.findOne({
            where: { id: id },
            include: [
                { model: db.User, where: { id: req.user.id } },
                {
                    model: db.Post,
                    through: 'PostCategory',
                    as: 'Posts',
                    attributes: ['id'],
                },
            ],
        });

        if (!foundCategory) {
            return res.status(404).send('Could not find a category.');
        }

        // if (foundCategory.Posts.length > 0) {
        //     return res
        //         .status(400)
        //         .send(
        //             `Could not delete this category. It includes ${
        //                 foundCategory.Posts.length
        //             } post(s).`
        //         );
        // }

        await foundCategory.destroy();

        // normalize
        normalizeCategoryOrder(req.user.id);

        return res.json({ id: id });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/liked', isLoggedIn, async (req, res, next) => {
    try {
        const limit = (req.query.limit && parseInt(req.query.limit, 10)) || 10;
        const keyword =
            req.query.keyword && decodeURIComponent(req.query.keyword);
        const pageToken = req.query.pageToken;
        const skip = pageToken ? 1 : 0;

        let pageTokenUserId = 0;
        let pageTokenPostId = 0;

        if (!!pageToken) {
            pageToken.split('|').forEach((el, index) => {
                switch (index) {
                    case 0:
                        pageTokenUserId = tryParseInt(el, 10, 0);
                        break;
                    case 1:
                        pageTokenPostId = tryParseInt(el, 10, 0);
                        break;
                    default:
                        break;
                }
            });
        }

        let where = {
            UserId: req.user.id,
        };

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

        if (pageToken) {
            const basisPost = await db.UserLikePost.findOne({
                where: {
                    UserId: pageTokenUserId,
                    PostId: pageTokenPostId,
                },
                order: [['createdAt', 'DESC']],
            });

            if (basisPost) {
                Object.assign(where, {
                    createdAt: {
                        [db.Sequelize.Op.lt]: basisPost.createdAt,
                    },
                });
                // where = {
                //     createdAt: {
                //         [db.Sequelize.Op.lt]: basisPost.createdAt,
                //     },
                // };
            }
        }

        const me = await db.User.findOne({
            where: { id: req.user.id },
            include: [
                {
                    model: db.Post,
                    through: db.UserLikePost,
                    as: 'LikePosts',
                },
            ],
        });

        const count = me.LikePosts.length;

        const likePosts = await db.UserLikePost.findAll({
            where: where,
            include: [
                {
                    model: db.Post,

                    include: [
                        {
                            model: db.User,
                            through: 'UserLikePost',
                            as: 'Likers',
                            attributes: ['id'],
                        },
                        {
                            model: db.User,
                            attributes: defaultUserAttributes,
                        },
                        {
                            model: db.Tag,
                            as: 'Tags',
                            through: 'PostTag',
                            attributes: ['id', 'name', 'slug'],
                        },
                        {
                            model: db.Category,
                            as: 'Categories',
                            through: 'PostCategory',
                            attributes: ['id', 'name', 'slug'],
                        },
                        {
                            model: db.PostAccessLog,
                            attributes: ['id'],
                        },
                    ],

                    attributes: [
                        'id',
                        'title',
                        'slug',
                        'excerpt',
                        'coverImage',
                        'UserId',
                        'createdAt',
                    ],
                    // as: 'LikePosts',
                },
            ],
            order: [['createdAt', 'DESC']],
            attributes: ['UserId', 'PostId', 'createdAt'],
            limit: limit,
            skip: skip,
        });

        return res.json({ records: likePosts, total: count });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

module.exports = router;
