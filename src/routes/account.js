/**
 * 사용자 계정
 */
const router = require('express').Router();
const passport = require('passport');
const db = require('../models');
const { findUserById } = require('./helper');
const { COOKIE_NAME } = require('./constants');

router.post('/signin', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            next(err);
        }

        if (info) {
            return res.status(401).send(info.reason);
        }

        // req.login 실행시 passport.serialize 실행
        return req.login(user, async loginErr => {
            if (loginErr) {
                return next(loginErr);
            }

            try {
                const fullUser = await findUserById(user.id);

                return res.json(fullUser);
            } catch (e) {
                console.error(e);
                return next(e);
            }
        });
    })(req, res, next);
});

router.post('/signout', (req, res, next) => {
    try {
        req.logout();
        req.session && req.session.destroy();
        return res.clearCookie(COOKIE_NAME).send('logout success.');
    } catch (e) {
        console.error(e);
        next(e);
    }
});

module.exports = router;
