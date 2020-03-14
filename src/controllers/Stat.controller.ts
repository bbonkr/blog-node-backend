import express from 'express';
import Sequelize from 'sequelize';
import { ControllerBase } from '../typings/ControllerBase';
import { tryParseInt } from '../lib/tryParseInt';
import { Post } from '../models/Post.model';
import { PostAccessLog } from '../models/PostAccessLog.model';
import { User } from '../models/User.model';
import { JsonResult } from '../typings/JsonResult';
import { Dictionary } from '../typings/Dictionary';
import { authWithJwt } from '../middleware/authWithJwt';
import moment from 'moment';

export class StatController extends ControllerBase {
    public getPath(): string {
        return '/api/me/stat';
    }
    protected initializeRoutes(): void {
        this.router.get('/general', authWithJwt, this.getGeneralStat.bind(this));
        this.router.get('/postread', authWithJwt, this.getPostRead.bind(this));
    }

    /**
     * 글 수, 받은 좋아요 수, 글 최근 작성일을 가져옵니다.
     * ```
     * GET:/api/stat/general
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async getGeneralStat(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<any> {
        try {
            const records = await Post.findAll({
                where: { UserId: req.user.id },
                include: [
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
                attributes: ['id', 'UserId', 'createdAt'],
                order: [['createdAt', 'DESC']],
            });

            let liked = 0;
            let latest: Date = null;

            records.forEach((p, index) => {
                if (index === 0) {
                    latest = p.createdAt;
                }
                liked += (p.likers && p.likers.length) || 0;
            });

            return res.json(
                new JsonResult<Dictionary<any>>({
                    success: true,
                    data: {
                        posts: records.length,
                        liked: liked,
                        latestPost: latest,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    private async getPostRead(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any> {
        try {
            const now = new Date();
            const before = new Date();

            before.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 30);

            const { count, rows } = await PostAccessLog.findAndCountAll({
                where: {
                    createdAt: {
                        [Sequelize.Op.gt]: before,
                    },
                },
                include: [
                    {
                        model: Post,
                        where: { UserId: req.user.id },
                        attributes: ['id', 'UserId'],
                    },
                ],
                // group: [
                //     Sequelize.fn('DATE', Sequelize.col('PostAccessLog.createdAt')),
                // ],
                // attributes: [
                //     Sequelize.fn('DATE', Sequelize.col('PostAccessLog.createdAt')),
                //     Sequelize.fn('count', Sequelize.col('PostAccessLog.id')),
                // ],
                attributes: ['createdAt'],
                order: [['createdAt', 'ASC']],
            });

            const stat: any[] = [];

            const tempDate = new Date();
            tempDate.setTime(before.getTime());
            do {
                stat.push({
                    xAxis: moment(tempDate).format('YYYY-MM-DD'),
                    read: 0,
                });

                tempDate.setTime(tempDate.getTime() + 1000 * 60 * 60 * 24);
                // console.log(
                //     `tempDate: ${moment(tempDate).format(
                //         'YYYY-MM-DD',
                //     )} | now: ${moment(now).format('YYYY-MM-DD')}`,
                // );
            } while (tempDate < now);

            rows.forEach(v => {
                const createdAt = new Date(v.createdAt);
                const found = stat.find(x => x.xAxis === moment(createdAt).format('YYYY-MM-DD'));
                if (found) {
                    found.read++;
                } else {
                    stat.push({
                        xAxis: moment(createdAt).format('YYYY-MM-DD'),
                        read: 1,
                    });
                }
            });

            return res.json(
                new JsonResult({
                    success: true,
                    data: {
                        count: count,
                        stat: stat,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }
}
