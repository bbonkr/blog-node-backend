import express, { Request, Response, NextFunction } from 'express';
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

export class AccountController extends ControllerBase {
    public getPath(): string {
        return '/api/account';
    }

    protected initializeRoutes(): void {
        this.router.post('/signin', this.signin.bind(this));
        this.router.post('/signout', this.signout.bind(this));
        this.router.post('/register', this.register.bind(this));
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
     *      username: string;
     *      email: string;
     *      displayName: string;
     *      password: string;
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
            const { email, username, password, displayName } = req.body;

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

            // TODO Send mail
            await this.sendVerifyEmail(req, me);

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

    private async sendVerifyEmail(
        req: express.Request,
        user: User,
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

        // TODO 프론트엔드 경로 필요
        const url = `${req.protocol}://${req.get(
            'host',
        )}/verifyemail?email=${hashedEmail}&code=${hashedCode}`;

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
