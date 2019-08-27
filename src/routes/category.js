/**
 * 포스트
 */
const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const categories = await db.Category.findAll({
            where: {
                slug: slug,
            },
            include: [
                {
                    model: db.Post,
                    through: 'PostCategory',
                    as: 'Posts',
                    attributes: ['id'],
                },
            ],
            order: [['ordinal', 'ASC']],
        });

        return res.json(categories);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

module.exports = router;
