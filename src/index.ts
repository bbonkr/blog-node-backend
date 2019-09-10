import dotenv from 'dotenv';
import { App } from './app';
import { PostsController } from './controllers/Posts.controller';
import { UsersController } from './controllers/Users.controller';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || 'localhost';
const protocol = process.env.PROTOCOL || 'http';

const dev = process.env.NODE_ENV !== 'production';
const prod = process.env.NODE_ENV === 'production';

const app: App = new App(
    [
        /* 컨트롤러 */
        new PostsController(),
        new UsersController(),
    ],
    port,
);

app.listen();
