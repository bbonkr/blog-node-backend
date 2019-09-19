import express from 'express';
import path from 'path';
import fs from 'fs';
import { ControllerBase } from '../typings/ControllerBase';
import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { Comment } from '../models/Comment.model';
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
import { markdownConverter } from '../helpers/converter';
import { IPostFormData } from '../typings/IPostFormData';
import { tryParseInt } from '../lib/tryParseInt';
import { getExcerpt, EXCERPT_LENGTH, stripHtml } from '../lib/post.helper';

export class MeController extends ControllerBase {
    public getPath(): string {
        return '/api/me';
    }
    protected initializeRoutes(): void {
        this.router.get('/', authWithJwt, this.getMyInfo.bind(this));

        this.router.get('/posts', authWithJwt, this.getPosts.bind(this));
        this.router.get('/post/:id', authWithJwt, this.getPost.bind(this));
        this.router.post('/post', authWithJwt, this.addPost.bind(this));
        this.router.patch('/post/:id', authWithJwt, this.updatePost.bind(this));
        this.router.delete(
            '/post/:id',
            authWithJwt,
            this.deletePost.bind(this),
        );

        this.router.get('/media', authWithJwt, this.getFiles.bind(this));
        this.router.get('/files', authWithJwt, this.getFiles.bind(this));

        this.router.post(
            '/media',
            authWithJwt,
            uploadToDiskStorage.array('files'),
            this.uploadFiles.bind(this),
        );

        this.router.post(
            '/files',
            authWithJwt,
            uploadToDiskStorage.array('files'),
            this.uploadFiles.bind(this),
        );

        this.router.delete(
            '/media/:id',
            authWithJwt,
            this.deleteFiles.bind(this),
        );
        this.router.delete(
            '/files/:id',
            authWithJwt,
            this.deleteFiles.bind(this),
        );

        this.router
            .get('/category', authWithJwt, this.getCategories.bind(this))
            .get('/categories', authWithJwt, this.getCategories.bind(this))
            .post('/category', authWithJwt, this.addCategory.bind(this))
            .patch('/category/:id', authWithJwt, this.updateCategory.bind(this))
            .delete(
                '/category:/id',
                authWithJwt,
                this.deleteCategory.bind(this),
            );

        this.router.get('/liked', authWithJwt, this.getLikedPosts.bind(this));

        this.router.get('/tags', authWithJwt, this.getTags.bind(this));
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
                        as: 'posts',
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
     *      page?: number;      // 페이지
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
            const keyword: string = decodeURIComponent(req.query.keyword || '');
            const page = parseInt(req.query.page || '1', 10);

            const where: WhereOptions = { userId: req.user.id };

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
                offset: this.getOffset(count, page, limit),
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
                where: { id: id, userId: req.user.id },
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
     *      page?: number;          // 페이지
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
            const page = tryParseInt(req.query.page, 10, 1);
            const limit = tryParseInt(req.query.limit, 10, 10);
            const keyword =
                req.query.keyword && decodeURIComponent(req.query.keyword);

            const where: WhereOptions = { userId: req.user.id };

            if (keyword) {
                Object.assign(where, {
                    fileName: {
                        [Sequelize.Op.like]: `%${keyword.trim()}%`,
                    },
                });
            }

            const { count } = await Image.findAndCountAll({
                where: where,
                attributes: ['id'],
            });

            const images = await Image.findAll({
                where: where,
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: this.getOffset(count, page, limit),
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
                        const filename = v.originalname;
                        const ext = path.extname(filename);
                        const basename = path.basename(filename, ext);

                        const savedFileExt = path.extname(v.path);
                        const savedFileBasename = encodeURIComponent(
                            path.basename(v.path, savedFileExt),
                        );
                        const savedFileDir = path.dirname(v.path);
                        const serverRootDir = path.normalize(
                            path.join(process.cwd()),
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
                            path: v.path,
                            fileName: basename,
                            fileExtension: ext,
                            size: v.size,
                            contentType: v.mimetype,
                            userId: req.user.id,
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
                    [Sequelize.Op.and]: {
                        userId: req.user.id,
                        id: id,
                    },
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
     *      page?: number;          // 페이지
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
            const page: number = tryParseInt(req.query.page, 10, 1);
            const limit: number = tryParseInt(req.query.limit, 10, 10);
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);

            const where: WhereOptions = { userId: req.user.id };

            if (keyword) {
                Object.assign(where, {
                    name: {
                        [Sequelize.Op.like]: `%${keyword}%`,
                    },
                });
            }

            const { count } = await Category.findAndCountAll({
                where: where,
                attributes: ['id'],
            });

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
                limit: limit || count,
                offset: this.getOffset(count, page, limit || count),
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
                    userId: req.user.id,
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
                    userId: req.user.id,
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
     *      page?: number;
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
            const page: number = tryParseInt(req.query.page, 10, 1);
            const limit: number = tryParseInt(req.query.limit, 10, 10);
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);

            const where: WhereOptions = {};

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
                include: [
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                        through: {
                            where: {
                                userId: req.user.id,
                            },
                        },
                        required: true, // inner join
                    },
                ],
                attributes: ['id'],
            });

            const likePosts = await Post.findAll({
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
                        through: {
                            where: {
                                userId: req.user.id,
                            },
                        },
                        attributes: ['id'],
                        required: true, // inner join
                    },
                ],
                order: [['createdAt', 'DESC']],
                limit: limit,
                offset: this.getOffset(count, page, limit),
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'excerpt',
                    'coverImage',
                    'createdAt',
                ],
            });

            return res.json(
                new JsonResult<IListResult<Post>>({
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

    /**
     * 글을 추가합니다.
     * ```
     * POST:/api/me/post
     * ```
     * ```
     * body {
     *      title: string;
     *      slug?: string;
     *      markdown: string;
     *      coverImage?: string;
     *      categories: {
     *          id?: number;
     *          name?: string;
     *          slug?: string;
     *      }[],
     *      tags: {
     *          id?: number;
     *          name?: string;
     *          slug?: string;
     *      }[]
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async addPost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const {
                title,
                slug,
                markdown,
                coverImage,
                categories,
                tags,
            }: IPostFormData = req.body;

            if (!title || title.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Please make sure title does have empty value.',
                });
            }

            if (!markdown || markdown.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Please make sure title does have empty value.',
                });
            }

            const html = markdownConverter().makeHtml(markdown);
            const text = stripHtml(html);
            const slugEdit = !!slug ? slug : makeSlug(title);

            const checkPost = await Post.findOne({
                where: { slug: slug, userId: req.user.id },
            });

            if (checkPost) {
                // 동일한 슬러그를 사용할 수 없습니다.
                throw new HttpStatusError({
                    code: 400,
                    message: `The [${slug}] post is exists already.`,
                });
            }

            const post = await Post.create({
                title: title,
                slug: slugEdit,
                markdown: markdown,
                html: html,
                text: text,
                excerpt: getExcerpt(text, EXCERPT_LENGTH),
                coverImage: coverImage,
                userId: req.user.id,
            });

            if (categories && categories.length > 0) {
                const foundCategories = await Promise.all(
                    categories.map((v) => {
                        return Category.findOne({ where: { slug: v.slug } });
                    }),
                );

                await Promise.all(
                    foundCategories.map((c) => {
                        return post.$add('categories', c);
                    }),
                );
            }

            if (tags && tags.length > 0) {
                const foundTags = await Promise.all(
                    tags.map((v) => {
                        const tagSlug = makeSlug(v.name);
                        return Tag.findOrCreate({
                            where: { slug: tagSlug },
                            defaults: {
                                name: v.name,
                                slug: tagSlug,
                            },
                        });
                    }),
                );

                await Promise.all(
                    foundTags.map((t) => {
                        return post.$add('tags', t[0]);
                    }),
                );
            }

            const newPost = await Post.findOne({
                where: {
                    id: post.id,
                    userId: req.user.id,
                },
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
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'html',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });

            return res.json(
                new JsonResult({
                    success: true,
                    data: newPost,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 글을 수정합니다.
     * ```
     * PATCH:/api/me/post/:id
     * ```
     * ```
     * body {
     *      title: string;
     *      slug?: string;
     *      markdown: string;
     *      coverImage?: string;
     *      categories: {
     *          id?: number;
     *          name?: string;
     *          slug?: string;
     *      }[],
     *      tags: {
     *          id?: number;
     *          name?: string;
     *          slug?: string;
     *      }[]
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async updatePost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const { id } = req.params;

            const post = await Post.findOne({
                where: { id: id, userId: req.user.id },
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
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
            });

            if (!post) {
                throw new HttpStatusError({
                    code: 404,
                    message:
                        'Could not find a post. The post may not be yours.',
                });
            }

            const {
                title,
                slug,
                markdown,
                coverImage,
                categories,
                tags,
            }: IPostFormData = req.body;

            if (!title || title.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Please make sure title does have empty value.',
                });
            }

            if (!markdown || markdown.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Please make sure title does have empty value.',
                });
            }

            const html = markdownConverter().makeHtml(markdown);
            const text = stripHtml(html);
            const slugEdit = !!slug ? slug : makeSlug(title);

            const checkPost = await Post.findOne({
                where: {
                    slug: slug,
                    userId: req.user.id,
                    id: { [Sequelize.Op.ne]: post.id },
                },
                attributes: ['id'],
            });

            if (!!checkPost) {
                // 동일한 슬러그를 사용할 수 없습니다.
                throw new HttpStatusError({
                    code: 400,
                    message: 'The [${slug}] post is exists already.',
                });
            }

            await post.update(
                {
                    title: title,
                    slug: slugEdit,
                    markdown: markdown,
                    html: html,
                    text: text,
                    excerpt: getExcerpt(text, EXCERPT_LENGTH),
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

            if (post.categories && post.categories.length > 0) {
                await Promise.all(
                    post.categories.map((c) => {
                        return post.$remove('categories', c);
                    }),
                );
            }

            if (post.tags && post.tags.length > 0) {
                await Promise.all(
                    post.tags.map((t) => {
                        return post.$remove('tags', t);
                    }),
                );
            }

            if (categories && categories.length > 0) {
                const foundCategories = await Promise.all(
                    categories.map((v) => {
                        return Category.findOne({ where: { slug: v.slug } });
                    }),
                );

                await Promise.all(
                    foundCategories.map((c) => {
                        return post.$add('categories', c);
                    }),
                );
            }

            if (tags && tags.length > 0) {
                const foundTagsAndCreated = await Promise.all(
                    tags.map((v) => {
                        const tagSlug: string = makeSlug(v.name);
                        return Tag.findOrCreate({
                            where: { slug: tagSlug },
                            defaults: {
                                name: v.name,
                                slug: tagSlug,
                            },
                        });
                    }),
                );

                await Promise.all(
                    foundTagsAndCreated.map((t) => {
                        return post.$add('tags', t[0]);
                    }),
                );
            }

            const changedPost = await Post.findOne({
                where: {
                    id: post.id,
                    userId: req.user.id,
                },
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
                attributes: [
                    'id',
                    'title',
                    'slug',
                    'html',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });

            return res.json(
                new JsonResult({
                    success: true,
                    data: changedPost,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 글을 삭제합니다.
     * ```
     * DELETE:/api/me/post/:id
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async deletePost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const id = parseInt(req.params.id, 10) || -1;
            const post = await Post.findOne({
                where: { id: id, userId: req.user.id },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: defaultUserAttributes,
                    },
                    {
                        model: Tag,
                    },
                    {
                        model: Category,
                    },
                    {
                        model: PostAccessLog,
                        attributes: ['id'],
                    },
                    {
                        model: Image,
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
                        model: Comment,
                    },
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                attributes: ['id', 'title', 'slug'],
            });

            if (!post) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a post.',
                });
            }

            const deletedPostId: number = post.id;

            if (post.categories && post.categories.length > 0) {
                await Promise.all(
                    post.categories.map((x) => {
                        return post.$remove('categories', x);
                    }),
                );
            }
            if (post.accessLogs && post.accessLogs.length > 0) {
                await Promise.all(
                    post.accessLogs.map((x) => {
                        return post.$remove('accessLogs', x);
                    }),
                );
            }
            if (post.tags && post.tags.length > 0) {
                await Promise.all(
                    post.tags.map((x) => {
                        return post.$remove('tags', x);
                    }),
                );
            }
            if (post.comments && post.comments.length > 0) {
                await Promise.all(
                    post.comments.map((x) => {
                        return post.$remove('comments', x);
                    }),
                );
            }

            if (post.likers && post.likers.length > 0) {
                await Promise.all(
                    post.likers.map((x) => {
                        post.$remove('likers', x);
                    }),
                );
            }

            await post.destroy();

            return res.json(
                new JsonResult({
                    success: true,
                    data: deletedPostId,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 작성글의 태그 목록을 가져옵니다.
     * ```
     * GET:/api/me/tags
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getTags(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        try {
            // const { page, limit, keyword } = req.query;
            // const pageValue: number = tryParseInt(page, 10, 1);
            // const limitValue: number = tryParseInt(limit, 10, 10);
            // const keywordValue: string = keyword && decodeURIComponent(keyword);

            // 페이징?
            // 클라이언트에서 입력시 필터?
            const { count, rows } = await Tag.findAndCountAll({
                include: [
                    {
                        model: Post,
                        where: {
                            userId: req.user.id,
                        },
                        required: true, // inner join
                        attributes: ['id'],
                    },
                ],
                order: [['name', 'ASC']],
                attributes: ['id', 'name', 'slug'],
            });

            return res.json(
                new JsonResult<IListResult<Tag>>({
                    success: true,
                    data: {
                        records: rows,
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
            where: { userId: userId },
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
