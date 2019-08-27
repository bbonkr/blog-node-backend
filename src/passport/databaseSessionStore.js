const expressSession = require('express-session');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 * Sequelize 를 사용하는 세션 저장소
 * !! Require('sequelize')
 * http://docs.sequelizejs.com/
 * ```
 * $ npm i sequelize --save
 * ```
 */
class DatabaseSessionStore extends expressSession.Store {
    constructor(config) {
        const options = {
            database: config.database,
            expiration:
                config.expiration || 1000 * 60 * 60 * 24 * 120 /** 120 days */,
            clearInterval:
                config.clearInterval || 1000 * 60 * 30 /** 30 minutes */,
        };
        super(options);

        if (!options || !options.database) {
            throw new Error('Please set config.database.');
        }

        this.options = options;
        this.db = options.database;
        this.startClearExpiredSessions();
    }

    destroy(sid, next) {
        try {
            this.db.Session.findOne({ where: { sid: sid } })
                .then(item => {
                    if (item) {
                        return item.destroy();
                    }

                    return null;
                })
                .catch(e => {
                    console.error(e);
                    return next(e);
                });
        } catch (e) {
            console.error(e);
            return next(e);
        }
    }

    get(sid, next) {
        try {
            this.db.Session.findOne({ where: { sid: sid } })
                .then(item => {
                    if (!item) {
                        // new Error('Could not find session')
                        return next();
                    }

                    const now = new Date();
                    const expire = new Date(item.exire);
                    if (expire < now) {
                        // new Error('The session has been expired.')
                        return next();
                    }

                    return next(null, JSON.parse(item.sess));
                })
                .catch(e => {
                    console.error(e);
                    return next(e);
                });
        } catch (e) {
            console.error(e);
            return next(e);
        }
    }

    set(sid, sess, next) {
        try {
            const expire = new Date().toJSON();

            this.db.Session.create({
                sid: sid,
                sess: JSON.stringify(sess),
                expire: expire,
            })
                .then(t => {
                    return next();
                })
                .catch(e => {
                    console.error(e);
                    next(e);
                });
        } catch (e) {
            console.error(e);
            next(e);
        }
    }

    clearExpiredSessions() {
        this.db.Session.destroy({
            where: {
                expire: {
                    [Op.le]: new Date().toJSON(),
                },
            },
        });
    }

    startClearExpiredSessions() {
        this._clearExpiredSessionsInterval = setInterval(
            this.clearExpiredSessions.bind(this),
            this.options.clearInterval
        );
    }
}

module.exports = DatabaseSessionStore;
