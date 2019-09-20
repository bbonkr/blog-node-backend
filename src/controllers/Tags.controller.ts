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

export class TagsController extends ControllerBase {
    public getPath(): string {
        return '/api/tags';
    }
    protected initializeRoutes(): void {
        this.router.get('/', this.getTags.bind(this));
        this.router.get('/:tag/posts', this.getPosts.bind(this));
    }

    /**
     * 태그 목록을 가져옵니다.
     * ```
     * GET:/api/tags
     * ```
     * ```
     * querystring: {
     *      page?: number;
     *      limit?: number;
     *      keyword?: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getTags(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        const thisRef = this;

        try {
            const limit: number =
                (req.query.limit && parseInt(req.query.limit, 10)) || 10;
            const keyword: string =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const page: number =
                (req.query.page && parseInt(req.query.page, 10)) || 1;

            const where: WhereOptions = {};
            if (keyword) {
                Object.assign(where, { name: { [Op.like]: `%${keyword}%` } });
            }

            const { count } = await Tag.findAndCountAll({
                where: where,
                attributes: ['id'],
            });

            const tags = await Tag.findAll({
                where: where,
                include: [
                    {
                        model: Post,
                        attributes: ['id', 'slug'],
                    },
                ],
                order: [['slug', 'ASC']],
                limit: limit,
                offset: thisRef.getOffset(count, page, limit),
                attributes: ['id', 'name', 'slug'],
            });

            return res.json(
                new JsonResult<IListResult<Tag>>({
                    success: true,
                    data: {
                        records: tags,
                        total: count,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 태그에 해당하는 글 목록을 가져옵니다.
     * ```
     * GET:/api/tags/:tag/posts
     * ```
     * ```
     * queryString {
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
            const tag = req.params.tag && decodeURIComponent(req.params.tag);
            const limit =
                (req.query.limit && parseInt(req.query.limit, 10)) || 10;
            const keyword =
                req.query.keyword && decodeURIComponent(req.query.keyword);
            const page = (req.query.page && parseInt(req.query.page, 10)) || 1;

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
                        required: true,
                    },
                ],
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
                        where: {
                            id: tagRef.id,
                        },
                        required: true,
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
