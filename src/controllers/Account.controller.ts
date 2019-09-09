import express, { Request, Response, NextFunction } from 'express';
import { ControllerBase } from '../typings/ControllerBase';
import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import { jwtOptions } from '../config/jwtOptions';
import { JsonResult } from '../typings/JsonResult';

export class AccountController extends ControllerBase {
    public getPath(): string {
        return '/api/account';
    }

    protected initializeRoutes(): void {
        this.router.post('/signin', this.signin);
        this.router.post('/signout', this.signout);
    }

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
}
