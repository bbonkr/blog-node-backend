import expressSession from 'express-session';
import Sequelize from 'sequelize';
import { Session } from './Session.model';
import { IDatabaseSessionStoreOptions } from '../typings/IDatabaseSessionStoreOptions';

const Op = Sequelize.Op;

/**
 * Sequelize 를 사용하는 세션 저장소
 * !! Require('sequelize')
 * http://docs.sequelizejs.com/
 * ```
 * $ npm i sequelize --save
 * ```
 */
export default class DatabaseSessionStore extends expressSession.Store {
    private options: IDatabaseSessionStoreOptions;
    private clearExpiredSessionsInterval: NodeJS.Timeout;

    constructor(config: IDatabaseSessionStoreOptions) {
        super(config);

        const options = {
            expiration:
                config.expiration || 1000 * 60 * 60 * 24 * 120 /** 120 days */,
            clearInterval:
                config.clearInterval || 1000 * 60 * 30 /** 30 minutes */,
        };

        this.options = options;
        this.startClearExpiredSessions();
    }

    public destroy = (sid: string, callback?: (err?: any) => void): void => {
        Session.findOne({
            where: {
                sid: sid,
            },
        })
            .then((session) => session.destroy())
            .catch((err) => {
                console.error(err);
                if (callback) {
                    callback(err);
                }
            });
    };

    public get = (
        sid: string,
        callback: (err: any, session?: Express.SessionData | null) => void,
    ): void => {
        Session.findOne({ where: { sid: sid } })
            .then((session) => {
                const now = new Date();
                const expired = session.expire > now;
                const err: Error | null = expired
                    ? new Error('Session was expired.')
                    : null;
                const sessionData: Express.SessionData | null = expired
                    ? null
                    : (JSON.parse(session.sess) as Express.SessionData);

                console.debug('session: ', expired ? 'expired' : 'valid');

                if (callback) {
                    callback(err, sessionData);
                }
            })
            .catch((err) => {
                console.error(err);

                if (callback) {
                    callback(err, null);
                }
            });
    };

    public set = (
        sid: string,
        session: Express.SessionData,
        callback?: (err?: any) => void,
    ): void => {
        const now = new Date();
        const expireMiliseconds = now.setMilliseconds(
            now.getMilliseconds() + this.options.expiration,
        );
        const expire = new Date(expireMiliseconds);

        const newSession = new Session({
            sid: sid,
            sess: JSON.stringify(session),
            expire: expire,
        });

        newSession
            .save()
            .then((_) => {
                console.debug('session created.');
                if (callback) {
                    callback(null);
                }
            })
            .catch((err) => {
                console.error(err);
                if (callback) {
                    callback(err);
                }
            });
    };

    private clearExpiredSessions(): void {
        Session.destroy({
            where: {
                expire: {
                    [Op.lte]: new Date(),
                },
            },
        })
            .then((affected) => {
                console.debug(`${affected} expired session deleted.`);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    private startClearExpiredSessions(): void {
        this.clearExpiredSessionsInterval = setInterval(
            () => this.clearExpiredSessions.bind(this),
            this.options.clearInterval,
        );
    }
}
