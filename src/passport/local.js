const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models');

module.exports = () => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passowrdField: 'password',
                passReqToCallback: true,
                session: false,
            },
            async (req, email, password, done) => {
                try {
                    const user = await db.User.findOne({
                        where: { email: email },
                    });

                    if (!user) {
                        // TODO 시도 횟수 증가
                        // req.connection.remoteAddress
                        return done(null, false, {
                            reason:
                                'Please check your account information and try again. Not exists email in our system.',
                        });
                    }

                    const result = await bcrypt.compare(
                        password,
                        user.password,
                    );
                    if (result) {
                        // 비밀번호를 전송하면 안됩니다.
                        delete user.password;

                        return done(null, user);
                    } else {
                        // TODO 시도 횟수 증가
                        return done(null, false, {
                            reason:
                                'Please check your account info and try again.',
                        });
                    }
                } catch (e) {
                    console.error(e);

                    return done(e);
                }
            },
        ),
    );
};
