import express, { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';
import { ControllerBase } from '../typings/ControllerBase';
import passport from 'passport';
import bcrypt from 'bcrypt';
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
            '/sendverifyemail',
            authWithJwt,
            this.sendVerifyEmailMessage.bind(this),
        );
        this.router.post('/verifyemail', this.verifyEmail.bind(this));
        this.router.post(
            '/resetpasswordrequest',
            this.resetPasswordRequest.bind(this),
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
            console.error(e);
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

            await this.sendVerifyEmail(req, me, verifyEmailUrl);

            return res.json(
                new JsonResult({
                    success: true,
                    data: me,
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
    private async sendVerifyEmailMessage(
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
                        data: 'Could not send a mail.',
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
                where: { UserId: user.id },
            });

            if (!!deleteCodes && deleteCodes.length > 0) {
                await Promise.all(deleteCodes.map((v) => v.destroy()));
            }

            const newResetPasswordCode = await ResetPasswordCode.create({
                email: hashedEmail,
                code: hashedCode,
                password: hashedPassword,
                expire: expire,
                UserId: user.id,
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
            where: { UserId: user.id },
        });

        if (!!deleteCodes && deleteCodes.length > 0) {
            // 이전 코드를 모두 제거합니다.
            await Promise.all(deleteCodes.map((v) => v.destroy()));
        }

        const newVerifyCode = await UserVerifyCode.create({
            email: hashedEmail,
            code: hashedCode,
            expire: expire,
            UserId: user.id,
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
}
