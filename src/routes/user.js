const router = require('express').Router();
const bcrypt = require('bcrypt');
const db = require('../models');
const Sequelize = require('sequelize');
const moment = require('moment');
const fs = require('fs');
const passport = require('passport');
const { isLoggedIn } = require('./middleware');
const { findUserById, defaultUserAttributes } = require('./helper');
const { randomString, sendMail } = require('./util');

const Op = Sequelize.Op;

const serviceName = 'Nodeblog';
const emailSender = 'app@bbon.kr';

/**
 * 사용자를 추가합니다.
 */
router.post('/', async (req, res, next) => {
    try {
        const { email, username, password, displayName } = req.body;

        let user = {};

        user = await db.User.findOne({
            where: {
                email: email,
            },
        });

        if (user) {
            return res.status(400).send(`${email} used by other account.`);
        }

        user = await db.User.findOne({
            where: { username: username.trim() },
        });

        if (user) {
            return res.status(400).send(`${username} used by other account.`);
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 12);
        const newUser = await db.User.create({
            email: email.trim(),
            username: username.trim(),
            displayName: displayName.trim(),
            password: hashedPassword,
        });

        const me = await findUserById(newUser.id);

        // TODO Send mail
        sendVerifyEmail(req, newUser);

        // sing in
        // passport.authenticate('local', (err, user, info) => {
        //     if (err) {
        //         console.error(err);
        //         next(err);
        //     }

        //     if (info) {
        //         return res.status(401).send(info.reason);
        //     }

        //     // req.login 실행시 passport.serialize 실행
        //     return req.login(user, async loginErr => {
        //         if (loginErr) {
        //             return next(loginErr);
        //         }

        //         try {
        //             const fullUser = await findUserById(user.id);

        //             return res.json(fullUser);
        //         } catch (e) {
        //             console.error(e);
        //             return next(e);
        //         }
        //     });
        // })(req, res, next);

        return res.json(me);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/**
 * 비밀번호 변경
 */
router.patch('/changepassword', isLoggedIn, async (req, res, next) => {
    try {
        const { currentPassword, password, passwordConfirm } = req.body;

        const me = await db.User.findOne({
            where: { id: req.user.id },
        });

        const result = await bcrypt.compare(
            currentPassword.trim(),
            me.password,
        );

        if (!result) {
            return res.status(401).send('Password does not match.');
        }

        if (password.trim() !== passwordConfirm.trim()) {
            return res
                .status(400)
                .send('Password and confirm password is different.');
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 12);

        const updatedMe = await me.update({ password: hashedPassword });

        delete updatedMe.password;

        return res.json(updatedMe);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

// TODO: change Email, username, displayname, photo src
router.patch('/info', isLoggedIn, async (req, res, next) => {
    try {
        const { email, username, displayName, photo } = req.body;
        const me = await db.User.findOne({
            where: { id: req.user.id },
        });

        if (!me) {
            return res.status(404).send('Could not find account.');
        }

        let user = await db.User.findOne({
            where: {
                id: { [Op.not]: req.user.id },
                username: username.trim(),
            },
        });

        if (user) {
            return res
                .status(400)
                .send(`${username.trim()} used by other account.`);
        }

        user = await db.User.findOne({
            where: {
                id: { [Op.not]: req.user.id },
                email: email.trim(),
            },
        });

        if (user) {
            return res
                .status(400)
                .send(`${email.trim()} used by other account.`);
        }

        let isEmailConfirmed = me.isEmailConfirmed;
        if (me.email.toLowerCase() !== email) {
            // 전자우편이 변경되면 다시 확인해야 합니다.
            isEmailConfirmed = false;
        }

        const updatedMe = await me.update({
            email: email.trim(),
            username: username.trim(),
            displayName: displayName.trim(),
            photo: photo.trim(),
            isEmailConfirmed: isEmailConfirmed,
        });

        delete updatedMe.password;

        return res.json(updatedMe);
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

const sendVerifyEmail = async (req, user) => {
    const { email } = user;
    const code = randomString(32);
    const hashedCode = await bcrypt.hash(code, 12);
    const hashedEmail = await bcrypt.hash(email, 12);

    const now = new Date();
    const term = 3 * 60 * 60 * 1000; // 3 hour after
    const expire = now.setTime(now.getTime() + term);

    const url = `${req.protocol}://${req.get(
        'host',
    )}/verifyemail?email=${hashedEmail}&code=${hashedCode}`;

    const deleteCodes = await db.UserVerifyCode.findAll({
        where: { UserId: user.id },
    });

    if (!!deleteCodes && deleteCodes.length > 0) {
        // 이전 코드를 모두 제거합니다.
        await Promise.all(deleteCodes.map(v => v.destroy()));
    }

    const newVerifyCode = await db.UserVerifyCode.create({
        email: hashedEmail,
        code: hashedCode,
        expire: expire,
        UserId: user.id,
    });

    if (!newVerifyCode) {
        throw new Error('Could not process a request. ');
    }

    const sent = await sendMail({
        to: email,
        from: emailSender,
        subject: `[${serviceName}] Verify your email address `,
        html: `
<h1>Verify Email Address</h1>
<p>Please navigate below link.</p>
<a href="${url}">Verify email</a>
<p>Please copy below url and paste address window on your web browser when may be unavailable navigating a link.</p>
<pre><code>${url}</code></pre>
<p>These link are valid until ${moment(expire).format(
            'YYYY-MM-DD HH:mm:ss',
        )} UTC</p>
<hr />
<p>Please do not reply this email.</p>
            `,
    });

    return sent;
};

/**
 * 전자우편 확인용 메시지를 전송합니다.
 */
router.post('/makeverifyemail', isLoggedIn, async (req, res, next) => {
    try {
        const sent = await sendVerifyEmail(req, req.user);
        if (!sent) {
            return res.send('Could not send a mail.');
        }
        return res.send('Send mail success');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/** 전자우편주소 확인 */
router.post('/verifyemail', async (req, res, next) => {
    try {
        const { code, email } = req.body;

        const verified = await db.UserVerifyCode.findOne({
            where: {
                code: code,
                email: email,
                // expire: {
                //     [Op.gt]: new Date(),
                // },
            },
            include: [
                {
                    model: db.User,
                    attributes: defaultUserAttributes,
                },
            ],
        });

        if (!verified) {
            return res.status(404).send('Could not find a associated data.');
        }

        if (verified.expire < new Date()) {
            return res
                .status(400)
                .send(
                    'Your link has expired. Please retry to verify your email.',
                );
        }

        const user = await db.User.findOne({
            where: { id: verified.User.id },
        });

        if (!user) {
            return res.status(404).send('Could not find a associated data.');
        }

        await user.update({
            isEmailConfirmed: true,
        });

        const updatedUser = findUserById(user.id);

        // 정상적으로 처리되면 요청은 바로 만료됩니다.
        await verified.update({
            expire: new Date(),
        });

        return res.json({
            email: updatedUser.email,
            isEmailConfirmed: updatedUser.isEmailConfirmed,
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

/**
 * 비밀번호 초기화 요청
 */
router.post('/requestresetpassword', async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await db.User.findOne({
            where: { email: email.trim() },
        });

        if (!user) {
            return res
                .status(404)
                .send('Could not find your email in our system.');
        }

        const newPassword = randomString(13);
        const code = randomString(32);
        const now = new Date();
        const term = 3 * 60 * 60 * 1000; // 3 hour after
        const expire = now.setTime(now.getTime() + term);

        const hashedEmail = await bcrypt.hash(email.toLowerCase().trim(), 12);
        const hashedCode = await bcrypt.hash(code, 12);
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const url = `${req.protocol}://${req.get(
            'host',
        )}/resetpassword?email=${hashedEmail}&code=${hashedCode}`;

        const deleteCodes = await db.ResetPasswordCode.findAll({
            where: { UserId: user.id },
        });

        if (!!deleteCodes && deleteCodes.length > 0) {
            const deletedCodes = await Promise.all(
                deleteCodes.map(v => v.destroy()),
            );
        }

        const newResetPasswordCode = await db.ResetPasswordCode.create({
            email: hashedEmail,
            code: hashedCode,
            password: hashedPassword,
            expire: expire,
            UserId: user.id,
        });

        const sent = await sendMail({
            to: user.email,
            from: emailSender,
            subject: `[${serviceName}] Reset your password. `,
            html: `
<h1>Reset Password</h1>
<p>&nbsp;</p>
<p>TEMPORARY PASSWORD: <code>${newPassword}</code></p>
<p>&nbsp;</p>
<p>Please navigate below link.</p>
<a href="${url}">Reset my password</a>
<p>Please copy below url and paste address window on your web browser when may be unavailable navigating a link.</p>
<pre><code>${url}</code></pre>
<p>These link are valid until ${moment(expire).format(
                'YYYY-MM-DD HH:mm:ss',
            )} UTC</p>
<hr />
<p>Please do not reply this email.</p>
            `,
        });

        if (!sent) {
            return res.status(400).send('Could not send a email.');
        }

        return res.send('Send mail success.');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

/** 비밀번호 초기화 */
router.post('/resetpassword', async (req, res, next) => {
    try {
        const { email, code, password, newPassword } = req.body;

        const resetPasswordCode = await db.ResetPasswordCode.findOne({
            where: {
                email: email,
                code: code,
            },
        });

        if (!resetPasswordCode) {
            return res
                .status(404)
                .send('Could not found a request to reset a password.');
        }

        if (resetPasswordCode.expire < new Date()) {
            return res.status(400).send('This request has been expired.');
        }

        const result = await bcrypt.compare(
            password,
            resetPasswordCode.password,
        );

        if (!result) {
            return res
                .status(400)
                .send('Check your request information that reset a password.');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        const user = await db.User.findOne({
            where: { id: resetPasswordCode.UserId },
        });

        const updatedUser = await user.update({
            password: hashedNewPassword,
        });

        // 정상적으로 처리되면 비밀번호 재설정 요청은 만료시킵니다.
        await resetPasswordCode.update({
            expire: new Date(),
        });

        return res.send('Password updated.');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.post('/unregister', isLoggedIn, async (req, res, next) => {
    try {
        const { password } = req.body;

        const me = await db.User.findOne({
            where: { id: req.user.id },
            include: [
                { model: db.Image },
                { model: db.Post },
                { model: db.Category },
                { model: db.Comment },
                { model: db.UserVerifyCode },
                { model: db.ResetPasswordCode },
                { model: db.UserLikePost },
            ],
        });

        const passwordResult = await bcrypt.compare(
            password.trim(),
            me.password,
        );

        if (!passwordResult) {
            return res.status(401).send('Password does not match.');
        }

        if (me.UserVerifyCodes && me.UserVerifyCodes.length > 0) {
            await Promise.all(me.UserVerifyCodes.map(v => v.destroy()));
        }

        if (me.ResetPasswordCodes && me.ResetPasswordCodes.length > 0) {
            await Promise.all(me.ResetPasswordCodes.map(v => v.destroy()));
        }

        if (me.UserLikePosts && me.UserLikePosts.length > 0) {
            await Promise.all(me.UserLikePosts.map(v => v.destroy()));
        }

        if (me.Comments && me.Comments.length > 0) {
            await Promise.all(me.Comments.map(v => v.destroy()));
        }

        if (me.Posts && me.Posts.length > 0) {
            await Promise.all(me.Posts.map(v => v.destory()));
        }

        if (me.Images && me.Images.length > 0) {
            const files = [];
            await Promise.all(
                me.Images.map(v => {
                    files.push(v.path);
                    return v.destroy();
                }),
            );

            if (files && files.length > 0) {
                files.forEach(v => {
                    if (fs.existsSync(v)) {
                        // 파일이 있는 경우만 삭제합니다.
                        fs.unlinkSync(v);
                    }
                });
            }
        }

        if (me.Categories && me.Categories.length > 0) {
            await Promise.all(me.Categories.map(v => v.destroy()));
        }

        // sign out
        // req.logout();
        // req.session && req.session.destroy();

        await me.destroy();

        return res.send('done.');
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

module.exports = router;
