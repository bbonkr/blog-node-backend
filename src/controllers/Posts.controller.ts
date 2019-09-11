import express, { Request, Response, NextFunction } from 'express';
import { ControllerBase } from '../typings/ControllerBase';
import Sequelize, { WhereOptions, Association } from 'sequelize';
import { User } from '../models/User.model';
import { defaultUserAttributes } from '../typings/defaultUserAttributes';
import { Post } from '../models/Post.model';
import { Tag } from '../models/Tag.model';
import { Category } from '../models/Category.model';
import { PostAccessLog } from '../models/PostAccessLog.model';
import { UserLikePost } from '../models/UserLikePost.model';
import { JsonResult } from '../typings/JsonResult';
import {
    IListResult,
    IListResultWithInformation,
} from '../typings/IListResult';
import { HttpStatusError } from '../typings/HttpStatusError';
const Op = Sequelize.Op;

export class PostsController extends ControllerBase {
    public getPath(): string {
        return '/api/posts';
    }

    protected initializeRoutes(): void {
        this.router.get('/', this.getPosts);
        // this.router.get('/tags/:tag', this.getTagPosts);
    }

    /**
     * 글 목록을 가져옵니다.
     * ```
     * GET:/api/posts
     * ```
     * ```
     * querystring {
     *      pageToken?: number;
     *      limit?: number;
     *      keyword?: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getPosts(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const limit: number =
                (req.query.limit && parseInt(req.query.limit, 10)) || 10;
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const pageToken: number =
                (req.query.pageToken && parseInt(req.query.pageToken, 10)) || 0;
            const skip: number = pageToken ? 1 : 0;

            let where: WhereOptions = {};

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
                    where = {
                        createdAt: {
                            [Op.lt]: basisPost.createdAt,
                        },
                    };
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
                        attributes: ['id', 'slug', 'name', 'ordinal'],
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
     * 태그에 해당하는 글 목록을 가져옵니다. ==> /api/tags/:tag/posts 로 이동
     * ```
     * GET:/api/posts/tags/:tag
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getTagPosts(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const tag = req.params.tag && decodeURIComponent(req.params.tag);
            const limit =
                (req.query.limit && parseInt(req.query.limit, 10)) || 10;
            const keyword =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const pageToken =
                (req.query.pageToken && parseInt(req.query.pageToken, 10)) || 0;
            const skip = pageToken ? 1 : 0;

            const tagRef = await Tag.findOne({
                where: { slug: tag },
                attributes: ['id', 'name', 'slug'],
            });

            if (!tagRef) {
                throw new HttpStatusError({
                    code: 404,
                    message: `Could not find tag. [${tag}]`,
                });
            }

            const where: WhereOptions = {};

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

            const { count, rows } = await Post.findAndCountAll({
                where: where,
                include: [
                    {
                        model: Tag,
                        where: {
                            id: tagRef.id,
                        },
                        attributes: ['id'],
                    },
                ],
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

            // Object.assign(where, {
            //     id: { [Op.in]: rows.map((r) => r.id) },
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
                        where: {
                            id: tagRef.id,
                        },
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
                new JsonResult<IListResultWithInformation<Post>>({
                    success: true,
                    data: {
                        records: posts,
                        total: count,
                        tag: tagRef,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }
}
