const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => {
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        // 캐싱 필요
        try {
            const user = await db.User.findOne({
                where: {
                    id: id,
                },
            });

            return done(null, user);
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });

    local();
};
