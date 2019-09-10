import express from 'express';
import path from 'path';
import fs from 'fs';
import { ControllerBase } from '../typings/ControllerBase';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { defaultUserAttributes } from '../typings/defaultUserAttributes';
import { HttpStatusError } from '../typings/HttpStatusError';
import { JsonResult } from '../typings/JsonResult';
import { authWithJwt } from '../middleware/authWithJwt';
import { WhereOptions } from 'sequelize/types';
import Sequelize from 'sequelize';
import { Category } from '../models/Category.model';
import { Image } from '../models/Image.model';
import { Tag } from '../models/Tag.model';
import { PostAccessLog } from '../models/PostAccessLog.model';
import { IListResult } from '../typings/IListResult';
import { uploadToDiskStorage } from '../middleware/uload';
import { replaceAll, makeSlug } from '../helpers/stringHelper';
import { UserLikePost } from '../models/UserLikePost.model';

export class MeController extends ControllerBase {
    public getPath(): string {
        return '/api/me';
    }
    protected initializeRoutes(): void {
        this.router.get('/', authWithJwt, this.getMyInfo);

        this.router.get('/posts', authWithJwt, this.getPosts);
        this.router.get('/post/:id', authWithJwt, this.getPost);

        this.router.get('/media', authWithJwt, this.getFiles);
        this.router.get('/files', authWithJwt, this.getFiles);

        this.router.post(
            '/media',
            authWithJwt,
            uploadToDiskStorage.array('files'),
            this.uploadFiles,
        );

        this.router.post(
            '/files',
            authWithJwt,
            uploadToDiskStorage.array('files'),
            this.uploadFiles,
        );

        this.router.delete('/media', authWithJwt, this.deleteFiles);
        this.router.delete('/files', authWithJwt, this.deleteFiles);

        this.router
            .get('/category', authWithJwt, this.getCategories)
            .get('/categories', authWithJwt, this.getCategories)
            .post('/category', authWithJwt, this.addCategory)
            .patch('/category', authWithJwt, this.updateCategory)
            .delete('/category', authWithJwt, this.deleteCategory);

        this.router.get('/liked', authWithJwt, this.getLikedPosts);
    }

    /**
     * 내 정보를 가져옵니다.
     * ```
     * GET:/api/me
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getMyInfo(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { id } = req.user;

            if (!id) {
                throw new HttpStatusError({
                    code: 401,
                    message: 'Please login then request again.',
                });
            }

            const me = await User.findOne({
                where: {
                    id: id,
                },
                include: [
                    {
                        model: Post,
                        attributes: ['id'],
                    },
                ],
                attributes: defaultUserAttributes,
            });

            if (!me) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find my info.',
                });
            }

            return res.json(
                new JsonResult({
                    success: true,
                    data: me,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 나의 글 목록을 가져옵니다.
     * ```
     * GET:/api/me/posts
     * ```
     * ```
     * querystring {
     *      pageToken?: string; // 글 목록의 마지막 글의 식별자
     *      limit?: number;     // 가져올 글의 수
     *      keyword?: string;   // 검색어
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getPosts(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const limit: number = parseInt(req.query.limit || '10', 10);
            const keyword: string = decodeURIComponent(req.query.keyword);
            const pageToken = parseInt(req.query.pageToken || '0', 10);
            const skip: number = pageToken ? 1 : 0;

            const where: WhereOptions = { UserId: req.user.id };

            if (keyword) {
                Object.assign(where, {
                    [Sequelize.Op.or]: [
                        { title: { [Sequelize.Op.like]: `%${keyword}%` } },
                        {
                            text: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                    ],
                });
            }

            const { count } = await Post.findAndCountAll({
                where: where,
                attributes: ['id'],
            });

            if (pageToken) {
                const basisPost = await Post.findOne({
                    where: {
                        id: pageToken,
                    },
                });

                if (basisPost) {
                    Object.assign(where, {
                        createdAt: {
                            [Sequelize.Op.lt]: basisPost.createdAt,
                        },
                    });
                    // where = {
                    //     createdAt: {
                    //         [db.Sequelize.Op.lt]: basisPost.createdAt,
                    //     },
                    // };
                }
            }

            const posts = await Post.findAll({
                where: where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: defaultUserAttributes,
                    },
                    {
                        model: Tag,
                        attributes: ['id', 'name', 'slug'],
                    },
                    {
                        model: Category,
                        attributes: ['id', 'name', 'slug'],
                    },
                    {
                        model: PostAccessLog,
                        attributes: ['id'],
                    },
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: skip,
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'excerpt',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });

            return res.json(
                new JsonResult<IListResult<Post>>({
                    success: true,
                    data: {
                        records: posts,
                        total: count,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 글을 가져옵니다.
     * ```
     * GET:/api/me/post/:id
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getPost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const id = parseInt(req.params.id || '0', 10);

            const post = await Post.findOne({
                where: { id: id, UserId: req.user.id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: defaultUserAttributes,
                    },
                    {
                        model: Tag,
                        attributes: ['id', 'name', 'slug'],
                    },
                    {
                        model: Category,
                        attributes: ['id', 'name', 'slug'],
                    },
                    {
                        model: PostAccessLog,
                        attributes: ['id'],
                    },
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'markdown',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });

            if (!post) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a post',
                });
            }

            return res.json(
                new JsonResult({
                    success: true,
                    data: post,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 파일 목록을 가져옵니다.
     * ```
     * GET:/api/me/media
     * ```
     * ```
     * querystring: {
     *      pageToken?: string;     // 글 목록의 마지막 글의 식별자
     *      limit?: number;         // 항목의 수
     *      keyword?: string;       // 검색어
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getFiles(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { pageToken, keyword, limit } = req.query;
            const recordLimit = parseInt(limit, 10) || 10;
            const skip = pageToken ? 1 : 0;

            const where: WhereOptions = { userId: req.user.id };

            if (keyword) {
                Object.assign(where, {
                    fileName: {
                        [Sequelize.Op.like]: `%${keyword.trim()}%`,
                    },
                });
            }

            const { count } = await Image.findAndCountAll({ where: where });

            if (pageToken) {
                const id = parseInt(pageToken, 10) || 0;
                const latestImage = await Image.findOne({
                    where: { id: id },
                });
                if (latestImage) {
                    Object.assign(where, {
                        id: {
                            [Sequelize.Op.lt]: latestImage.id,
                        },
                    });
                }
            }

            const images = await Image.findAll({
                where: where,
                order: [['createdAt', 'DESC']],
                limit: recordLimit,
                offset: skip,
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

            return res.json(
                new JsonResult<IListResult<Image>>({
                    success: true,
                    data: {
                        records: images,
                        total: count,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 파일을 업로드 합니다.
     * ```
     * POST:/api/me/media
     * ```
     * ```
     * body: {
     *      files: FormFile[]
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async uploadFiles(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const files = req.files as Express.Multer.File[];

            const images = await Promise.all(
                files.map(
                    (v: Express.Multer.File): Promise<Image> => {
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

                        return Image.create({
                            src: src,
                            path: `${path.join(serverRootDir, v.path)}`,
                            fileName: basename,
                            fileExtension: ext,
                            size: v.size,
                            contentType: v.mimetype,
                            UserId: req.user.id,
                        });
                    },
                ),
            );

            // console.log('Promise.all ==> images', images);

            const addedImages = await Image.findAll({
                where: {
                    id: {
                        [Sequelize.Op.in]: images.map((v) => v.id),
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

            return res.json(
                new JsonResult<IListResult<Image>>({
                    success: true,
                    data: {
                        records: addedImages,
                        total: addedImages.length,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 파일을 삭제합니다.
     * ```
     * DELETE:/api/me/media/:id
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async deleteFiles(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { id } = req.params;

            const foundImage = await Image.findOne({
                where: {
                    userId: req.user.id,
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
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a file.',
                });
            }

            const imageId: number = foundImage.id;

            if (fs.existsSync(foundImage.path)) {
                // 파일이 있는 경우만 삭제합니다.
                fs.unlinkSync(foundImage.path);
            }

            await foundImage.destroy();

            delete foundImage.path;

            return res.json(
                new JsonResult({
                    success: true,
                    data: imageId,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 분류를 가져옵니다.
     * ```
     * GET:/api/me/categories
     * ```
     * ```
     * querystring: {
     *      pageToken?: number;     // 목록의 마지막 항목의 식별자
     *      limit?: number;         // 항목의 수
     *      keyword? string;        // 검색어
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getCategories(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const pageToken: number = parseInt(req.query.pageToken || '0', 10);
            const limit: number = parseInt(req.query.limit || '10', 10);
            const keyword: string = decodeURIComponent(req.query.keyword);

            // const skip = pageToken ? 1 : 0;
            const where: WhereOptions = { UserId: req.user.id };

            if (keyword) {
                Object.assign(where, {
                    name: {
                        [Sequelize.Op.like]: `%${keyword}%`,
                    },
                });
            }

            const { count } = await Category.findAndCountAll({ where: where });

            if (!!pageToken) {
                const lastCategory = await Category.findOne({
                    where: {
                        userId: req.user.id,
                        id: pageToken,
                    },
                });
                if (!!lastCategory) {
                    Object.assign(where, {
                        ordinal: {
                            [Sequelize.Op.gt]: lastCategory.ordinal,
                        },
                    });
                }
            }

            const categories = await Category.findAll({
                where: where,
                include: [
                    {
                        model: User,
                        attributes: ['id'],
                    },
                    {
                        model: Post,
                        attributes: ['id'],
                    },
                ],
                order: [['ordinal', 'ASC']],
                limit: limit,
                // skip: skip,
            });

            return res.json(
                new JsonResult<IListResult<Category>>({
                    success: true,
                    data: {
                        records: categories,
                        total: count,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 분류를 추가합니다.
     * ```
     * POST:/api/me/category
     * ```
     * ```
     * body {
     *      name: string;
     *      slug?: string;
     *      ordinal?: number;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async addCategory(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { name, slug, ordinal } = req.body;
            const slugValue = slug || makeSlug(name);
            let ordinalValue: number = parseInt(`${ordinal || '0'}`, 10);

            const duplicatedCategory = await Category.findOne({
                where: { slug: slugValue },
                include: [
                    {
                        model: User,
                        where: { id: req.user.id },
                        attributes: ['id'],
                    },
                ],
            });

            if (!!duplicatedCategory) {
                const message = `Duplicated item found. It may be '${duplicatedCategory.name}'.`;
                throw new HttpStatusError({
                    code: 409,
                    message: message,
                });
            }

            if (ordinalValue < 1) {
                const maxOridinal: number = await Category.max('ordinal', {
                    where: {
                        userId: req.user.id,
                    },
                });

                ordinalValue = maxOridinal || 1;
            }

            const addedCategory = await Category.create({
                name,
                slug: slugValue,
                ordinal: ordinalValue,
                userId: req.user.id,
            });

            const adjustOridnal = await Category.findAll({
                where: {
                    UserId: req.user.id,
                    id: {
                        [Sequelize.Op.not]: addedCategory.id,
                    },
                    ordinal: {
                        [Sequelize.Op.gte]: addedCategory.ordinal,
                    },
                },
            });

            if (adjustOridnal) {
                await Promise.all(
                    adjustOridnal.map((v) => {
                        return v.update({
                            ordinal: ordinal + 1,
                        });
                    }),
                );
            }

            // normalize
            this.normalizeCategoryOrder(req.user.id);

            return res.json(
                new JsonResult({
                    success: true,
                    data: addedCategory,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 분류를 변경합니다.
     * ```
     * PATCH:/api/me/category/:id
     * ```
     * ```
     * body {
     *      name: string;
     *      slug?: string;
     *      ordinal?: number;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async updateCategory(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { id, name, slug, ordinal } = req.body;
            let ordinalValue = parseInt(`${ordinal || '0'}`, 10);

            const foundCategory = await Category.findOne({
                where: { id: id, userId: req.user.id },
            });

            if (!foundCategory) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a category',
                });
            }

            const slugValue = slug || makeSlug(name);

            const duplicatedCategory = await Category.findOne({
                where: {
                    slug: slugValue,
                    id: {
                        [Sequelize.Op.not]: id,
                    },
                    userId: req.user.id,
                },
            });

            if (!!duplicatedCategory) {
                const message = `Duplicated item found. It may be '${duplicatedCategory.name}'.`;
                throw new HttpStatusError({
                    code: 409,
                    message: message,
                });
            }

            if (ordinalValue < 1) {
                const maxOridinal: number = await Category.max('ordinal', {
                    where: {
                        userid: req.user.id,
                    },
                });

                ordinalValue = maxOridinal || 1;
            }

            await foundCategory.update({
                name: name,
                slug: slug || makeSlug(name),
                ordinal: ordinalValue,
            });

            const updatedCategory = await Category.findOne({
                where: {
                    id: id,
                    userId: req.user.id,
                },
                include: [
                    {
                        model: Post,
                        attributes: ['id'],
                    },
                ],
            });

            const adjustOridnal = await Category.findAll({
                where: {
                    UserId: req.user.id,
                    id: {
                        [Sequelize.Op.not]: updatedCategory.id,
                    },
                    ordinal: {
                        [Sequelize.Op.gte]: updatedCategory.ordinal,
                    },
                },
            });

            if (adjustOridnal) {
                await Promise.all(
                    adjustOridnal.map((v) => {
                        return v.update({
                            ordinal: ordinal + 1,
                        });
                    }),
                );
            }

            // normalize
            this.normalizeCategoryOrder(req.user.id);

            return res.json(
                new JsonResult({
                    success: true,
                    data: updatedCategory,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 분류를 삭제합니다.
     * ```
     * DELETE:/api/me/category/:id
     * ```
     * 분류를 사용중인 글이 있는 경우 분류를 삭제할 수 없습니다.
     * @param req
     * @param res
     * @param next
     */
    private async deleteCategory(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const id = parseInt(req.params.id || '0', 10);

            const foundCategory = await Category.findOne({
                where: { id: id, userId: req.user.id },
                include: [
                    {
                        model: Post,
                        attributes: ['id'],
                    },
                ],
            });

            if (!foundCategory) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a category',
                });
            }

            const categoryId: number = foundCategory.id;

            if (foundCategory.posts.length > 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: `Could not delete this category. It includes ${foundCategory.posts.length} post(s).`,
                });
            }

            await foundCategory.destroy();

            // normalize
            this.normalizeCategoryOrder(req.user.id);

            return res.json(
                new JsonResult({
                    success: true,
                    data: categoryId,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 좋아요 표시된 글 목록을 가져옵니다.
     * ```
     * GET:/api/me/liked
     * ```
     * ```
     * querystring {
     *      pageToken?: string;
     *      limmit?: number;
     *      keyword?: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getLikedPosts(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const limit: number = parseInt(req.query.limit || '10', 10);
            const keyword: string = decodeURIComponent(req.query.keyword);
            const pageToken: string = req.query.pageToken;
            const skip: number = pageToken ? 1 : 0;

            let pageTokenUserId = 0;
            let pageTokenPostId = 0;

            if (!!pageToken) {
                pageToken.split('|').forEach((el, index) => {
                    switch (index) {
                        case 0:
                            pageTokenUserId = parseInt(el || '0', 10);
                            break;
                        case 1:
                            pageTokenPostId = parseInt(el || '0', 10);
                            break;
                        default:
                            break;
                    }
                });
            }

            const where: WhereOptions = {
                UserId: req.user.id,
            };

            if (keyword) {
                Object.assign(where, {
                    [Sequelize.Op.or]: [
                        { title: { [Sequelize.Op.like]: `%${keyword}%` } },
                        {
                            text: {
                                [Sequelize.Op.like]: `%${keyword}%`,
                            },
                        },
                    ],
                });
            }

            if (pageToken) {
                const basisPost = await UserLikePost.findOne({
                    where: {
                        userId: pageTokenUserId,
                        postId: pageTokenPostId,
                    },
                    order: [['createdAt', 'DESC']],
                });

                if (basisPost) {
                    Object.assign(where, {
                        createdAt: {
                            [Sequelize.Op.lt]: basisPost.createdAt,
                        },
                    });
                    // where = {
                    //     createdAt: {
                    //         [db.Sequelize.Op.lt]: basisPost.createdAt,
                    //     },
                    // };
                }
            }

            const me = await User.findOne({
                where: { id: req.user.id },
                include: [
                    {
                        model: Post,
                        as: 'likedPosts',
                    },
                ],
            });

            const count = me.likedPosts.length;

            const likePosts = await UserLikePost.findAll({
                where: where,
                include: [
                    {
                        model: Post,
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: defaultUserAttributes,
                            },
                            {
                                model: Tag,
                                attributes: ['id', 'name', 'slug'],
                            },
                            {
                                model: Category,
                                attributes: ['id', 'name', 'slug'],
                            },
                            {
                                model: PostAccessLog,
                                attributes: ['id'],
                            },
                            {
                                model: User,
                                as: 'likers',
                                attributes: ['id'],
                            },
                        ],
                        attributes: [
                            'id',
                            'title',
                            'slug',
                            'excerpt',
                            'coverImage',
                            'createdAt',
                        ],
                        // as: 'LikePosts',
                    },
                ],
                order: [['createdAt', 'DESC']],
                attributes: ['UserId', 'PostId', 'createdAt'],
                limit: limit,
                offset: skip,
            });

            return res.json(
                new JsonResult<IListResult<UserLikePost>>({
                    success: true,
                    data: {
                        records: likePosts,
                        total: count,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    private async normalizeCategoryOrder(userId: number): Promise<void> {
        // normalize
        const categoriesSort = await Category.findAll({
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
    }
}
