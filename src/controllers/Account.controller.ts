import express, { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import { ControllerBase } from '../typings/ControllerBase';
import passport from 'passport';
import bcrypt from 'bcrypt';
import fs from 'fs';
import jsonwebtoken from 'jsonwebtoken';
import { jwtOptions } from '../config/jwtOptions';
import { JsonResult } from '../typings/JsonResult';
import { User } from '../models/User.model';
import { HttpStatusError } from '../typings/HttpStatusError';
import { randomString } from '../helpers/stringHelper';
import { UserVerifyCode } from '../models/UserVerifyCode.model';
import { sendMail } from '../lib/sendMail';
import { emailOptions } from '../config/emailOptions';
import { appOptions } from '../config/appOptions';
import moment from 'moment';
import { defaultUserAttributes } from '../typings/defaultUserAttributes';
import { authWithJwt } from '../middleware/authWithJwt';
import { ResetPasswordCode } from '../models/ResetPasswordCode.model';
import { Category } from '../models/Category.model';
import { Post } from '../models/Post.model';
import { Image } from '../models/Image.model';
import { Comment } from '../models/Comment.model';
import { UserLikePost } from '../models/UserLikePost.model';

export class AccountController extends ControllerBase {
    public getPath(): string {
        return '/api/account';
    }

    protected initializeRoutes(): void {
        this.router.post('/signin', this.signin.bind(this));
        this.router.post('/signout', this.signout.bind(this));
        this.router.post('/register', this.register.bind(this));
        this.router.patch(
            '/changepassword',
            authWithJwt,
            this.changePassword.bind(this),
        );
        this.router.patch('/info', authWithJwt, this.updateInfo.bind(this));
        this.router.post(
            '/requestverifyemail',
            authWithJwt,
            this.requestVerifyEmailMessage.bind(this),
        );
        this.router.post('/verifyemail', this.verifyEmail.bind(this));
        this.router.post(
            '/requestresetpassword',
            this.resetPasswordRequest.bind(this),
        );
        this.router.post('/resetpassword', this.resetPassword.bind(this));
        this.router.post(
            '/unregister',
            authWithJwt,
            this.unregister.bind(this),
        );
    }

    /**
     * 사용자 인증
     * ```
     * POST:/api/account/signin
     * ```
     * ```
     * body {
     *      username: string;
     *      password: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private signin(req: Request, res: Response, next: NextFunction): any {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.error(err);
                next(err);
            }

            if (info) {
                return res.status(401).send(info.reason);
            }

            // req.login 실행시 passport.serialize 실행
            return req.login(user, { session: false }, async (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }

                try {
                    // const user = await findUserById(user.id);
                    // const signOptions = {
                    //     expiresIn: '7d',
                    //     issuer: jwtOptions.issuer,
                    //     audience: jwtOptions.audience,
                    //     subject: 'userInfo',
                    // };

                    // const payload = {
                    //     id: user.id,
                    //     username: user.username,
                    //     displayName: user.displayName,
                    //     email: user.email,
                    // };
                    // const token = jsonwebtoken.sign(
                    //     payload,
                    //     jwtOptions.secret,
                    //     signOptions,
                    // );

                    const token = this.generateToken(user);

                    return res.json(
                        new JsonResult({
                            success: true,
                            data: {
                                user,
                                token,
                            },
                        }),
                    );
                } catch (e) {
                    return next(e);
                }
            });
        })(req, res, next);
    }

    /**
     * 로그아웃
     * ```
     * POST:/api/account/signout
     * ```
     * @param req
     * @param res
     * @param next
     */
    private signout(
        req: Request,
        res: Response,
        next: express.NextFunction,
    ): any {
        const cookieName = process.env.COOKIE_NAME;
        try {
            req.logout();

            if (req.session) {
                req.session.destroy((err) => {
                    console.error(err);
                });
            }

            return res.clearCookie(cookieName).send(
                new JsonResult({
                    success: true,
                    data: 'logout success.',
                    message: 'logout success.',
                }),
            );
        } catch (e) {
            // console.error(e);
            next(e);
        }
    }

    /**
     * 사용자 등록
     * ```
     * POST:/api/account/register
     * ```
     * ```
     * body {
     *      username: string;           // 사용자 계정 이름
     *      email: string;              // 전자우편주소
     *      displayName: string;        // 출력이름
     *      password: string;           // 비밀번호
     *      verifyEmailUrl: string;     // 전자우편주소 확인 페이지 주소 eg.) https://sample-blog.bbon.me/verifyemail
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async register(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const {
                email,
                username,
                password,
                displayName,
                verifyEmailUrl,
            } = req.body;

            this.validateRequired(email, 'Email is required.');
            this.validateRequired(username, 'Username is required.');
            this.validateRequired(password, 'Password is required');
            this.validateRequired(displayName, 'Display name is required.');
            this.validateRequired(
                verifyEmailUrl,
                'Verify email url is required.',
            );

            let user: User;

            user = await User.findOne({
                where: {
                    email: email,
                },
            });

            if (user) {
                throw new HttpStatusError({
                    code: 400,
                    message: `${email} used by other account.`,
                });
            }

            user = await User.findOne({
                where: { username: username.trim() },
            });

            if (user) {
                throw new HttpStatusError({
                    code: 400,
                    message: `${username} used by other account.`,
                });
            }

            const hashedPassword = await bcrypt.hash(password.trim(), 12);
            const newUser = await User.create({
                email: email.trim(),
                username: username.trim(),
                displayName: displayName.trim(),
                password: hashedPassword,
            });

            // const me = await findUserById(newUser.id);
            const me = await User.findOne({
                where: { id: newUser.id },
                attributes: defaultUserAttributes,
            });

            const token = this.generateToken(me);

            await this.sendVerifyEmail(req, me, verifyEmailUrl);

            return res.json(
                new JsonResult({
                    success: true,
                    data: {
                        user: me,
                        token: token,
                    },
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 비밀번호를 변경합니다.
     * ```
     * PATCH:/api/account/changepassword
     * ```
     * ```
     * body {
     *      currentPassword: string;
     *      password: string;
     *      passwordConfirm: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async changePassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { currentPassword, password, passwordConfirm } = req.body;

            const me = await User.findOne({
                where: { id: req.user.id },
            });

            if (!me) {
                throw new HttpStatusError({
                    code: 401,
                    message: 'Could not find a user information',
                });
            }

            const result = await bcrypt.compare(
                currentPassword.trim(),
                me.password,
            );

            if (!result) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Password does not match.',
                });
            }

            if (password.trim() !== passwordConfirm.trim()) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Password and confirm password is different.',
                });
            }

            const hashedPassword = await bcrypt.hash(password.trim(), 12);

            await me.update({ password: hashedPassword });

            const updatedMe = User.findOne({
                where: { id: req.user.id },
                attributes: defaultUserAttributes,
            });

            return res.json(
                new JsonResult({
                    success: true,
                    data: updatedMe,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 사용자 정보를 변경합니다.
     * ```
     * PATCH:/api/account/info
     * ```
     * ```
     * body{
     *      email: string;
     *      username: string;
     *      displayName: string;
     *      photo: string;
     *      verifyEmailUrl: string;     // 전자우편주소 확인 페이지 주소 eg.) https://sample-blog.bbon.me/verifyemail
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async updateInfo(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const {
                email,
                username,
                displayName,
                photo,
                verifyEmailUrl,
            } = req.body;

            if (!email || email.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Email address required.',
                });
            }

            if (!username || username.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Username required.',
                });
            }

            if (!displayName || displayName.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Display Name required.',
                });
            }

            if (!verifyEmailUrl || verifyEmailUrl.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Verify Email Url required.',
                });
            }

            const me = await User.findOne({
                where: { id: req.user.id },
            });

            if (!me) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find account information.',
                });
            }

            let user = await User.findOne({
                where: {
                    id: { [Sequelize.Op.not]: req.user.id },
                    username: username.trim(),
                },
            });

            if (user) {
                throw new HttpStatusError({
                    code: 400,
                    message: `${username.trim()} used by other account.`,
                });
            }

            user = await User.findOne({
                where: {
                    id: { [Sequelize.Op.not]: req.user.id },
                    email: email.trim(),
                },
            });

            if (user) {
                throw new HttpStatusError({
                    code: 400,
                    message: `${email.trim()} used by other account.`,
                });
            }

            let isEmailConfirmed = me.isEmailConfirmed;

            if (me.email.toLowerCase() !== email.toLowerCase()) {
                // 전자우편이 변경되면 다시 확인해야 합니다.
                isEmailConfirmed = false;
            }

            await me.update({
                email: email.trim(),
                username: username.trim(),
                displayName: displayName.trim(),
                photo: photo.trim(),
                isEmailConfirmed: isEmailConfirmed,
            });

            const updatedMe = await User.findOne({
                where: {
                    id: req.user.id,
                },
                attributes: defaultUserAttributes,
            });

            if (!isEmailConfirmed) {
                await this.sendVerifyEmail(req, updatedMe, verifyEmailUrl);
            }

            return res.json(
                new JsonResult({
                    success: true,
                    data: updatedMe,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 전자우편주소 확인 메시지를 전송합니ㅏㄷ.
     * ```
     * POST:/api/account/sendverifyemail
     * ```
     * ```
     * body{
     *      verifyEmailUrl: string;     // 전자우편주소 확인 페이지 주소 eg.) https://sample-blog.bbon.me/verifyemail
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async requestVerifyEmailMessage(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { verifyEmailUrl } = req.body;
            const me = await User.findOne({
                where: {
                    id: req.user.id,
                },
            });

            if (!me) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a account information.',
                });
            }

            const sent = await this.sendVerifyEmail(req, me, verifyEmailUrl);

            if (!sent) {
                return res.send(
                    new JsonResult({
                        success: false,
                        message: 'Could not send a mail.',
                    }),
                );
            }
            return res.send(
                new JsonResult({
                    success: true,
                    message: 'Send mail success',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 전자우편주소 확인 처리
     * ```
     * POST:/api/account/verifyemail
     * ```
     * ```
     * body {
     *      code: string;
     *      email: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async verifyEmail(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { code, email } = req.body;

            const verified = await UserVerifyCode.findOne({
                where: {
                    code: code,
                    email: email,
                    // expire: {
                    //     [Sequelize.Op.gt]: new Date(),
                    // },
                },
                // order: [['expired', 'DESC']],
                include: [
                    {
                        model: User,
                        attributes: defaultUserAttributes,
                    },
                ],
            });

            if (!verified) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a associated data.',
                });
            }

            if (verified.expire < new Date()) {
                throw new HttpStatusError({
                    code: 400,
                    message:
                        'Your link has expired. Please retry to verify your email.',
                });
            }

            const user = await User.findOne({
                where: { id: verified.user.id },
            });

            if (!user) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a associated data.',
                });
            }

            await user.update({
                isEmailConfirmed: true,
            });

            const updatedUser = await User.findOne({
                where: {
                    id: user.id,
                },
                attributes: [...defaultUserAttributes, 'isEmailConfirmed'],
            });

            // 정상적으로 처리되면 요청은 바로 만료됩니다.
            await verified.update({
                expire: new Date(),
            });

            return res.json(
                new JsonResult({
                    success: true,
                    data: updatedUser,
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 비밀번호 초기화 요청
     * ```
     * POST:/api/account/requestresetpassword
     * ```
     * ```
     * body {
     *  email: string;              // 비밀번호 초기화 요청자 전자우편주소
     *  resetPasswordUrl: string;   // 비밀번호 초기화 페이지 주소 e.g.) https://sample-blog.bbon.me/resetpassword
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async resetPasswordRequest(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { email, resetPasswordUrl } = req.body;
            if (!email || email.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Email address required.',
                });
            }

            if (!resetPasswordUrl || resetPasswordUrl.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Reset password url required.',
                });
            }

            const user = await User.findOne({
                where: {
                    email: email,
                },
            });

            if (!user) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not find a account information.',
                });
            }

            if (!user.isEmailConfirmed) {
                throw new HttpStatusError({
                    code: 400,
                    message:
                        'Could not send an email message via email address that does not verified',
                });
            }

            const sender = emailOptions.sender;
            const serviceName = appOptions.title;
            const newPassword = randomString(13);
            const code = randomString(32);
            const now = new Date();
            const term = 3 * 60 * 60 * 1000; // 3 hour after
            const expire = now.setTime(now.getTime() + term);

            const hashedEmail = await bcrypt.hash(
                email.toLowerCase().trim(),
                12,
            );
            const hashedCode = await bcrypt.hash(code, 12);
            const hashedPassword = await bcrypt.hash(newPassword, 12);

            const deleteCodes = await ResetPasswordCode.findAll({
                where: { userId: user.id },
            });

            if (!!deleteCodes && deleteCodes.length > 0) {
                await Promise.all(deleteCodes.map((v) => v.destroy()));
            }

            const newResetPasswordCode = await ResetPasswordCode.create({
                email: hashedEmail,
                code: hashedCode,
                password: hashedPassword,
                expire: expire,
                userId: user.id,
            });

            const url = `${resetPasswordUrl}?email=${newResetPasswordCode.email}&code=${newResetPasswordCode.code}`;

            const sent = await sendMail({
                to: {
                    email: user.email,
                    name: user.displayName,
                },
                from: {
                    email: sender.email,
                    name: sender.name,
                },
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
                throw new HttpStatusError({
                    code: 400,
                    message: 'Could not send a email',
                });
            }

            return res.send(
                new JsonResult({
                    success: true,
                    message: 'Sent a email successfully.',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 비밀번호 초기화
     * ```
     * POST:/api/account/resetpassword
     * ```
     * ```
     * body {
     *  email: string;
     *  code: string;
     *  password: string;
     *  newPassword: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async resetPassword(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { email, code, password, newPassword } = req.body;

            if (!email || email.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Email field value is required.',
                });
            }

            if (!code || code.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Code field value is required.',
                });
            }

            if (!password || password.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Password field value is required.',
                });
            }

            if (!newPassword || newPassword.trim().length === 0) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'New password field value is required.',
                });
            }

            const resetPasswordCode = await ResetPasswordCode.findOne({
                where: {
                    email: email,
                    code: code,
                },
            });

            if (!resetPasswordCode) {
                throw new HttpStatusError({
                    code: 404,
                    message: 'Could not found a request to reset a password.',
                });
            }

            if (resetPasswordCode.expired < new Date()) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'This request has been expired.',
                });
            }

            const result = await bcrypt.compare(
                password,
                resetPasswordCode.password,
            );

            if (!result) {
                throw new HttpStatusError({
                    code: 400,
                    message:
                        'Check your request information that reset a password.',
                });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            const user = await User.findOne({
                where: { id: resetPasswordCode.userId },
            });

            const updatedUser = await user.update({
                password: hashedNewPassword,
            });

            // 정상적으로 처리되면 비밀번호 재설정 요청은 만료시킵니다.
            await resetPasswordCode.update({
                expire: new Date(),
            });

            return res.json(
                new JsonResult<any>({
                    success: true,
                    message: 'Password changed.',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 회원탈퇴
     * ```
     * POST:/api/account/unregister
     * ```
     * ```
     * body {
     *  password: string;
     * }
     * ```
     * @param req
     * @param res
     * @param next
     */
    private async unregister(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        try {
            const { password } = req.body;

            const me = await User.findOne({
                where: { id: req.user.id },
                include: [
                    { model: Image },
                    { model: Post, as: 'posts' },
                    { model: Category },
                    { model: Comment },
                    { model: UserVerifyCode },
                    { model: ResetPasswordCode },
                    { model: UserLikePost, as: 'likedPosts' },
                ],
            });

            const passwordResult = await bcrypt.compare(
                password.trim(),
                me.password,
            );

            if (!passwordResult) {
                throw new HttpStatusError({
                    code: 400,
                    message: 'Password does not match.',
                });
            }

            if (me.verifyCodes && me.verifyCodes.length > 0) {
                await Promise.all(me.verifyCodes.map((v) => v.destroy()));
            }

            if (me.resetPasswordCodes && me.resetPasswordCodes.length > 0) {
                await Promise.all(
                    me.resetPasswordCodes.map((v) => v.destroy()),
                );
            }

            if (me.likedPosts && me.likedPosts.length > 0) {
                await Promise.all(me.likedPosts.map((v) => v.destroy()));
            }

            if (me.comments && me.comments.length > 0) {
                await Promise.all(me.comments.map((v) => v.destroy()));
            }

            if (me.categories && me.categories.length > 0) {
                await Promise.all(me.categories.map((v) => v.destroy()));
            }

            if (me.images && me.images.length > 0) {
                const files: string[] = [];
                await Promise.all(
                    me.images.map((v) => {
                        files.push(v.path);
                        return v.destroy();
                    }),
                );

                if (files && files.length > 0) {
                    files.forEach((v) => {
                        if (fs.existsSync(v)) {
                            // 파일이 있는 경우만 삭제합니다.
                            fs.unlinkSync(v);
                        }
                    });
                }
            }

            if (me.posts && me.posts.length > 0) {
                await Promise.all(me.posts.map((v) => v.destroy()));
            }

            await me.destroy();

            return res.send(
                new JsonResult<any>({
                    success: true,
                    message: 'Thanks for using. See you next time.',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }

    /**
     * 전자우편 확인을 위한 메시지를 전송합니다.
     * @param req 요청
     * @param user 사용자
     * @param returnUrl 전자우편확인 페이지 주소
     */
    private async sendVerifyEmail(
        req: express.Request,
        user: User,
        returnUrl: string,
    ): Promise<boolean> {
        const { email, displayName } = user;
        const emailSender = emailOptions.sender;
        const serviceName = appOptions.title;
        const code = randomString(32);
        const hashedCode = await bcrypt.hash(code, 12);
        const hashedEmail = await bcrypt.hash(email, 12);

        const now = new Date();
        const term = 3 * 60 * 60 * 1000; // 3 hour after
        const expire = now.setTime(now.getTime() + term);

        const url = `${returnUrl}?email=${hashedEmail}&code=${hashedCode}`;

        const deleteCodes = await UserVerifyCode.findAll({
            where: { userId: user.id },
        });

        if (!!deleteCodes && deleteCodes.length > 0) {
            // 이전 코드를 모두 제거합니다.
            await Promise.all(deleteCodes.map((v) => v.destroy()));
        }

        const newVerifyCode = await UserVerifyCode.create({
            email: hashedEmail,
            code: hashedCode,
            expire: expire,
            userId: user.id,
        });

        if (!newVerifyCode) {
            throw new Error('Could not process a request. ');
        }

        const sent = await sendMail({
            to: [
                {
                    email: email,
                    name: displayName,
                },
            ],
            from: {
                email: emailSender.email,
                name: emailSender.name,
            },
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
    }

    private generateToken(user: User): string {
        const signOptions = {
            expiresIn: '7d',
            issuer: jwtOptions.issuer,
            audience: jwtOptions.audience,
            subject: 'userInfo',
        };

        const payload = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
        };
        const token = jsonwebtoken.sign(
            payload,
            jwtOptions.secret,
            signOptions,
        );

        if (!token) {
            console.warn('[PASSPORT]: JWT fails to generate.');
        }

        return token;
    }
}
