import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { sequelize } from './models';
import passport = require('passport');
import { User } from './models/User.model';
import DatabaseSessionStore from './passport/databaseSessionStore';
import { IControllerBase } from './typings/IControllerBase';
import { errorLogger, errorJsonResult } from './middleware/errorProcess';
import { PassportInitializer } from './passport/PassportInitializer';

export class App {
    public port: number;
    public readonly cookieName: string = process.env.COOKIE_NAME;

    private app: express.Application;

    constructor(controllers: IControllerBase[], port?: number) {
        this.app = express();
        this.port = port || 3000;

        this.initializeDatabaseConnection();
        this.initializePassport();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`[APP] App is running on the port ${this.port}`);
        });
    }

    private initializeDatabaseConnection() {
        sequelize
            .sync({
                // If force is true, each DAO will do DROP TABLE IF EXISTS ...,
                // before it tries to create its own table
                force: false,
                // If alter is true, each DAO will do ALTER TABLE ... CHANGE ... Alters tables to fit models.
                // Not recommended for production use.
                // Deletes data in columns that were removed or had their type changed in the model.
                alter: false,
            })
            .then((_) => {
                console.log('[APP] Database ready!');
            });
    }

    private initializePassport() {
        const passportInitializer = new PassportInitializer();

        passportInitializer.init();
    }

    private initializeMiddlewares(): void {
        const dbSessionStore = new DatabaseSessionStore({
            expiration: 1000 * 60 * 60 * 24 * 90,
        });

        this.app.use(morgan('dev'));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/', express.static('uploads'));

        this.app.use(
            cors({
                origin: 'http://localhost:3000',
                credentials: true,
            }),
        );

        this.app.use(cookieParser(process.env.COOKIE_SECRET));
        this.app.use(
            expressSession({
                name: this.cookieName,
                resave: false,
                saveUninitialized: false,
                secret: process.env.COOKIE_SECRET,
                cookie: {
                    httpOnly: true,
                    secure: false, // https 사용시 true
                },
                store: dbSessionStore,
            }),
        );

        this.app.use(passport.initialize());
        this.app.use(passport.session());
    }

    private initializeControllers(controllers: IControllerBase[]) {
        controllers.forEach((controller, index) => {
            this.app.use(controller.getPath(), controller.getRouter());
        });

        // 404
        this.app.get(
            '*',
            (
                req: express.Request,
                res: express.Response,
                next: express.NextFunction,
            ) => {
                res.status(404).send({ message: `Not fount: ${req.url}` });
            },
        );

        this.app.use(errorLogger);
        this.app.use(errorJsonResult);
    }
}
