import express from 'express';
import passport from 'passport';
import { User } from '../models/User.model';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { jwtOptions } from '../config/jwtOptions';
import {
    Strategy as LocalStrategy,
    IVerifyOptions,
    IStrategyOptionsWithRequest,
} from 'passport-local';
import bcrypt from 'bcrypt';
import { HttpStatusError } from '../typings/HttpStatusError';

export class PassportInitializer {
    public init(): void {
        this.initializePassprt();
        this.initializeLocal();
        this.initializeJwt();
    }

    private initializePassprt() {
        passport.serializeUser((user: User, done: any): void => {
            console.debug('passport.serializeUser');
            return done(null, user.id);
        });

        passport.deserializeUser(async (id: number, done) => {
            console.debug('>>>> passport.deserializeUser');
            try {
                const user = await User.findOne({
                    where: {
                        id: id,
                    },
                    attributes: [
                        'id',
                        'username',
                        'displayName',
                        'email',
                        'photo',
                    ],
                });

                return done(null, user);
            } catch (e) {
                console.error(e);
                return done(e, null);
            }
        });
    }

    private initializeLocal(): void {
        passport.use(
            new LocalStrategy(
                {
                    usernameField: 'username',
                    passwordField: 'password',
                    passReqToCallback: true,
                    session: false,
                },
                async (
                    req: express.Request,
                    username: string,
                    password: string,
                    done: (
                        error: any,
                        user?: User,
                        options?: IVerifyOptions,
                    ) => void,
                ): Promise<void> => {
                    try {
                        let user: User = await User.findOne({
                            where: { username: username },
                        });

                        if (!user) {
                            user = await User.findOne({
                                where: { email: username },
                            });
                        }

                        if (!user) {
                            // TODO 시도 횟수 증가
                            // req.connection.remoteAddress
                            return done(null, null, {
                                message:
                                    'Please check your account information and try again.',
                            });
                        }

                        const result = await bcrypt.compare(
                            password,
                            user.password,
                        );

                        if (result) {
                            const transferUser: User = await User.findOne({
                                where: { id: user.id },
                                attributes: [
                                    'id',
                                    'username',
                                    'displayName',
                                    'email',
                                    'photo',
                                ],
                            });

                            return done(null, transferUser, null);
                        } else {
                            // TODO 시도 횟수 증가
                            return done(null, null, {
                                message:
                                    'Please check your account info and try again.',
                            });
                        }
                    } catch (e) {
                        console.error(e);

                        return done(e, null, {
                            message: e.message,
                        });
                    }
                },
            ),
        );
    }

    private initializeJwt(): void {
        const options = {
            ...jwtOptions,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtOptions.secret,
            passReqToCallback: true,
        };

        const strategy = new JwtStrategy(
            options,
            async (
                req: express.Request,
                payload: any,
                done: (
                    error: any,
                    user?: any,
                    options?: IVerifyOptions,
                ) => void,
            ): Promise<void> => {
                try {
                    const { username } = payload;

                    const user = await User.findOne({
                        where: {
                            username: username,
                        },
                        attributes: [
                            'id',
                            'username',
                            'email',
                            'displayName',
                            'photo',
                        ],
                    });

                    if (!user) {
                        throw new Error(
                            'could not find a account information.',
                        );
                    }

                    req.user = {
                        id: user.id,
                        username: user.username,
                    };
                    req.userInfo = user;

                    done(null, user, null);
                } catch (err) {
                    console.error(err);
                    done(err, null, {
                        message: err.message,
                    });
                }
            },
        );

        passport.use(strategy);
    }
}
