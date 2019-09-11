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
        this.router.get('/', this.getPosts.bind(this));
    }

    /**
     * 글 목록을 가져옵니다.
     * ```
     * GET:/api/posts
     * ```
     * ```
     * querystring {
     *      page?: number;
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
            const page: number =
                (req.query.page && parseInt(req.query.page, 10)) || 1;

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
}
