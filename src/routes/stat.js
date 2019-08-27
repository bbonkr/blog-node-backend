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

router.get('/general', isLoggedIn, async (req, res, next) => {
    try {
        const records = await db.Post.findAll({
            where: { UserId: req.user.id },
            include: [
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
            attributes: ['id', 'UserId', 'createdAt'],
            order: [['createdAt', 'DESC']],
        });

        let liked = 0;
        let latest = new Date();

        records.forEach((p, index) => {
            if (index === 0) {
                latest = p.createdAt;
            }
            liked += (p.Likers && p.Likers.length) || 0;
        });

        return res.json({
            posts: records.length,
            liked: liked,
            latestPost: latest,
        });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.get('/postread', isLoggedIn, async (req, res, next) => {
    try {
        let now = new Date();
        let before = new Date();

        before.setTime(now.getTime() - 1000 * 60 * 60 * 24 * 30);

        const records = await db.PostAccessLog.findAndCountAll({
            where: {
                createdAt: {
                    [Op.gt]: before,
                },
            },
            include: [
                {
                    model: db.Post,
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

        const { rows } = records;
        const stat = [];

        let tempDate = new Date();
        tempDate.setTime(before.getTime());
        do {
            stat.push({
                xAxis: moment(tempDate).format('YYYY-MM-DD'),
                read: 0,
            });

            tempDate.setTime(tempDate.getTime() + 1000 * 60 * 60 * 24);
            console.log(
                `tempDate: ${moment(tempDate).format(
                    'YYYY-MM-DD',
                )} | now: ${moment(now).format('YYYY-MM-DD')}`,
            );
        } while (tempDate < now);

        rows.forEach(v => {
            let createdAt = new Date(v.createdAt);
            const found = stat.find(
                x => x.xAxis === moment(createdAt).format('YYYY-MM-DD'),
            );
            if (found) {
                found.read++;
            } else {
                stat.push({
                    xAxis: moment(createdAt).format('YYYY-MM-DD'),
                    read: 1,
                });
            }
        });

        return res.json({ count: records.count, stat: stat });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

module.exports = router;
