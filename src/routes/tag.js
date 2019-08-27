/**
 * 태그
 */
const express = require('express');
const router = express.Router();
const db = require('../models');
const Sequelize = require('sequelize');
const { isLoggedIn } = require('./middleware');
const Op = Sequelize.Op;

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const tags = await db.Tag.findAll({});

        return res.json(tags);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
