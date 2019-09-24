import express from 'express';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import { sequelize } from './models';
import passport = require('passport');
import { User } from './models/User.model';
import DatabaseSessionStore from './passport/databaseSessionStore';
import { IControllerBase } from './typings/IControllerBase';
import { errorLogger, errorJsonResult } from './middleware/errorProcess';
import { PassportInitializer } from './passport/PassportInitializer';
import { appOptions } from './config/appOptions';
import { PostsController } from './controllers/Posts.controller';
import { UsersController } from './controllers/Users.controller';
import { MeController } from './controllers/Me.controller';
import { AccountController } from './controllers/Account.controller';
import { TagsController } from './controllers/Tags.controller';
import { SampleController } from './controllers/Sample.controller';
import { StatController } from './controllers/Stat.controller';
import { JsonResult } from './typings/JsonResult';

export class App {
    public port: number;
    // https://expressjs.com/ko/advanced/best-practice-security.html#use-cookies-securely
    public readonly cookieName: string = 'sessionID';

    private readonly isTest: boolean = process.env.NODE_ENV === 'test';
    private readonly isProd: boolean = process.env.NODE_ENV === 'production';

    private app: express.Application;

    constructor(port?: number) {
        this.app = express();
        this.port = port || 3000;

        if (this.isTest) {
            // 콘솔출력을 제거합니다.
            console.log = (message: any, ...optionalPrameters: any[]): void => {
                //
            };
        }
    }

    public async initializeExpress(): Promise<App> {
        await this.initializeDatabaseConnection();
        this.initializePassport();
        this.initializeMiddlewares();
        this.initializeControllers();

        return this;
    }

    public getExpressApp(): express.Application {
        return this.app;
    }

    public listen(): void {
        this.app.listen(this.port, '0.0.0.0', () => {
            console.log(`[APP] App is running on the port ${this.port}`);
        });
    }

    private async initializeDatabaseConnection(): Promise<void> {
        await sequelize.sync({
            // If force is true, each DAO will do DROP TABLE IF EXISTS ...,
            // before it tries to create its own table
            force: false,
            // If alter is true, each DAO will do ALTER TABLE ... CHANGE ... Alters tables to fit models.
            // Not recommended for production use.
            // Deletes data in columns that were removed or had their type changed in the model.
            alter: false,
        });

        console.log('[APP] Database ready!');
    }

    private initializePassport() {
        const passportInitializer = new PassportInitializer();

        passportInitializer.init();

        console.log('[APP] Passport ready!');
    }

    private initializeMiddlewares(): void {
        const dbSessionStore = new DatabaseSessionStore({
            expiration: 1000 * 60 * 60 * 24 * 90,
        });
        const uploadDir = path.join(process.cwd(), 'uploads');
        // console.info('[APP]: upload dir ==> ', uploadDir);
        // console.info('[APP]: current path ==> ', process.cwd());

        this.app.set('upload-dir', express.static(uploadDir));

        if (this.isProd) {
            // 프로덕션 우수 사례: 보안
            // https://expressjs.com/ko/advanced/best-practice-security.html
            // https://helmetjs.github.io/docs/
            this.app.use(helmet());
            // setting Content Security Policy
            this.app.use(helmet.contentSecurityPolicy());
            // adds some small XSS protections
            // this.app.use(helmet.xssFilter()); // ==> default
            // prevent clickjacking
            // this.app.use(helmet.frameguard()); // ==> default
            // HTTP Public Key Pinning
            this.app.use(helmet.hpkp());
            // HTTP Strict Transport Security
            // this.app.use(helmet.hsts()); // ==> default
            // remove the X-Powered-By header
            this.app.use(helmet.hidePoweredBy());
            //  disable client-side caching
            this.app.use(helmet.noCache());
            // X-Download-Options for IE8+
            this.app.use(helmet.ieNoOpen());
            this.app.disable('x-powered-by');
        }

        this.app.use(morgan(this.isProd ? 'combined' : 'dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use('/uploads', express.static(uploadDir));

        this.app.use(
            cors({
                origin: appOptions.corsOrigin,
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
                    secure: this.isProd, // https 사용시 true
                    domain: appOptions.cookieDomain,
                },
                store: dbSessionStore,
            }),
        );

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        console.log('[APP] Middlewares ready!');
    }

    private initializeControllers() {
        const controllers: IControllerBase[] = [
            /* 컨트롤러 */
            new AccountController(),
            new MeController(),
            new PostsController(),
            new SampleController(),
            new TagsController(),
            new UsersController(),
            new StatController(),
        ];

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
                // res.status(404).send({ message: `Not fount: ${req.url}` });
                return res.status(404).json(
                    new JsonResult({
                        success: false,
                        message: `Not fount: ${req.url}`,
                    }),
                );
            },
        );

        if (!this.isTest) {
            this.app.use(errorLogger);
        }

        this.app.use(errorJsonResult);

        console.log('[APP] Router ready!');
    }
}
