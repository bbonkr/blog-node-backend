import express from 'express';
import Sequelize from 'sequelize';
import { WhereOptions } from 'sequelize/types';
import { ControllerBase } from '../typings/ControllerBase';
import { User } from '../models/User.model';
import { HttpStatusError } from '../typings/HttpStatusError';
import { Post } from '../models/Post.model';
import { defaultUserAttributes } from '../typings/defaultUserAttributes';
import { Tag } from '../models/Tag.model';
import { Category } from '../models/Category.model';
import { PostAccessLog } from '../models/PostAccessLog.model';
import { JsonResult } from '../typings/JsonResult';
import {
    IListResult,
    IListResultWithInformation,
} from '../typings/IListResult';
import { normalizeUsername } from '../helpers/stringHelper';
import { authWithJwt } from '../middleware/authWithJwt';

export class UsersController extends ControllerBase {
    public getPath(): string {
        return '/api/users';
    }

    protected initializeRoutes(): void {
        this.router.get('/:user/posts', this.getUserPosts);
        this.router.get('/:user/posts/:post', this.getUserPost);
        this.router.get('/:user/categories', this.getUserCategories);
        this.router.get(
            '/:user/categories/:category',
            this.getUserCategoryPosts,
        );
        this.router.post('/:user/posts/:post/like', authWithJwt, this.likePost);
        this.router.delete(
            '/:user/posts/:post/like',
            authWithJwt,
            this.unlikePost,
        );
    }

    /**
     * 사용자의 글을 가져옵니다.
     * GET: /api/users/:user/posts
     *
     * @param req
     * @param res
     * @param next
     */
    private async getUserPosts(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            /** 사용자 username :==> @userName */
            const user: string = decodeURIComponent(req.params.user);
            const limit: number = parseInt(req.query.limit || '10', 10);
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const pageToken: number = parseInt(req.query.pageToken || '-1', 10);
            const skip: number = pageToken ? 1 : 0;

            const username = normalizeUsername(user);

            const foundUser = await User.findOne({
                where: { username: username },
                attributes: ['id'],
            });

            if (!foundUser) {
                // return res.status(404).send(`Could not find user [${user}]`);
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find user [${user}]`,
                });
            }

            const where: WhereOptions = { UserId: foundUser.id };

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
                        attributes: ['id', 'slug', 'name'],
                    },
                    {
                        model: Category,
                        attributes: ['id', 'slug', 'name'],
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
     * GET: /api/users/:user/posts/:post
     * @param req
     * @param res
     * @param next
     */
    private async getUserPost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            /** 사용자 username :==> @userName */
            const user: string = decodeURIComponent(req.params.user);
            const slug: string = decodeURIComponent(req.params.post);

            if (!user) {
                // return res.status(401).send('유효한 요청이 아닙니다.');
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request: Unknown user.',
                });
            }

            if (!slug) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request: Unknow post.',
                });
                // return res.status(401).send('유효한 요청이 아닙니다.');
            }
            const username = normalizeUsername(user);

            const foundUser = await User.findOne({
                where: { username: username },
                attributes: ['id'],
            });

            if (!foundUser) {
                // return res.status(404).send(`Could not find user [@${user}]`);
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find user [@${user}]`,
                });
            }

            const post = await Post.findOne({
                where: {
                    slug: slug,
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: defaultUserAttributes,
                        where: {
                            id: foundUser.id,
                        },
                    },
                    {
                        model: Tag,
                        attributes: ['id', 'slug', 'name'],
                    },
                    {
                        model: Category,
                        attributes: ['id', 'slug', 'name'],
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
                    'excerpt',
                    'coverImage',
                    'createdAt',
                    'updatedAt',
                ],
            });

            if (!post) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find a post: ${slug}`,
                });
            }

            if (req.user && req.user.id !== post.user.id) {
                // 작성자의 접근은 기록하지 않습니다.
                const accessLog = new PostAccessLog({
                    ipAddress: req.connection.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    userId: req.user && req.user.id,
                });

                await post.$add('accessLogs', accessLog);
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
     * 사용자의 분류 목록을 가져옵니다. - 구현되지 않음
     * GET:/api/users/:user/categories
     * @param req
     * @param res
     * @param next
     */
    private async getUserCategories(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            return res.json(
                new JsonResult({
                    success: true,
                    data: 'Not implemented.',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 사용자 분류의 글 목록을 가져옵니다.
     * GET:/api/users/:user/categories/:category
     * @param req
     * @param res
     * @param next
     */
    private async getUserCategoryPosts(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            /** 사용자 username :==> @userName */
            const user: string = decodeURIComponent(req.params.user);
            const category: string = decodeURIComponent(req.params.category);
            const limit: number = parseInt(req.query.limit || '10', 10);
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const pageToken = parseInt(req.query.pageToken || '-1', 10);
            const skip: number = pageToken ? 1 : 0;

            const username = normalizeUsername(user);

            const foundUser = await User.findOne({
                where: { username: username },
                attributes: defaultUserAttributes,
            });

            if (!foundUser) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find user [${user}]`,
                });
            }

            const foundCategory = await Category.findOne({
                where: {
                    slug: category,
                    userId: foundUser.id,
                },
                attributes: ['id', 'slug', 'name'],
            });

            if (!foundCategory) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find a category [${category}]`,
                });
            }

            const where: WhereOptions = { UserId: foundUser.id };

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

            const { count, rows } = await Post.findAndCountAll({
                where: where,
                include: [
                    {
                        model: Category,
                        where: {
                            id: foundCategory.id,
                        },
                    },
                ],
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
                }
            }

            // Object.assign(where, {
            //     id: {
            //         [Sequelize.Op.in]: rows.map((r) => r.id),
            //     },
            // });

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
                        attributes: ['id', 'slug', 'name'],
                    },
                    {
                        model: Category,
                        attributes: ['id', 'slug', 'name'],
                        where: {
                            id: foundCategory.id,
                        },
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
                new JsonResult<IListResultWithInformation<Post>>({
                    success: true,
                    data: {
                        records: posts,
                        total: count,
                        user: foundUser,
                        category: foundCategory,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 글 좋아요
     * POST:/api/users/:user/posts/:post/like
     * @param req
     * @param res
     * @param next
     */
    private async likePost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            /** 사용자 username :==> @userName */
            const user: string = decodeURIComponent(req.params.user);
            const slug: string = decodeURIComponent(req.params.post);

            if (!user) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request.',
                });
            }

            if (!slug) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request.',
                });
            }
            const username = normalizeUsername(user);

            const foundUser = await User.findOne({
                where: { username: username },
                attributes: ['id'],
            });

            if (!foundUser) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find user [@${user}]`,
                });
            }

            let post = await Post.findOne({
                where: {
                    slug: slug,
                },
                include: [
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
            });

            if (!post) {
                return res.status(404).send(`Could not find a post. [${slug}]`);
            }

            const likerIndex = post.likers.findIndex(
                (x) => x.id === req.user.id,
            );

            if (likerIndex >= 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'You marked to like this post already.',
                });
            }

            await post.$add('likers', req.user.id);

            post = await Post.findOne({
                where: {
                    slug: slug,
                },
                include: [
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                attributes: ['id'],
            });

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
     * 글 좋아요 취소
     * DELETE:/api/users/:user/posts/:post/like
     * @param req
     * @param res
     * @param next
     */
    private async unlikePost(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            /** 사용자 username :==> @userName */
            const user: string = decodeURIComponent(req.params.user);
            const slug: string = decodeURIComponent(req.params.post);

            if (!user) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request.',
                });
            }

            if (!slug) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Invalid request.',
                });
            }
            const username = normalizeUsername(user);

            const foundUser = await User.findOne({
                where: { username: username },
                attributes: ['id'],
            });

            if (!foundUser) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find user [@${user}]`,
                });
            }

            let post = await Post.findOne({
                where: {
                    slug: slug,
                },
                include: [
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                attributes: ['id'],
            });

            if (!post) {
                return res.status(404).send(`Could not find a post. [${slug}]`);
            }

            const likerIndex = post.likers.findIndex(
                (x) => x.id === req.user.id,
            );
            if (likerIndex < 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'You did not mark to like this post.',
                });
            }

            await post.$remove('likers', req.user.id);

            post = await Post.findOne({
                where: {
                    slug: slug,
                },
                include: [
                    {
                        model: User,
                        as: 'likers',
                        attributes: ['id'],
                    },
                ],
                attributes: ['id'],
            });

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
}
