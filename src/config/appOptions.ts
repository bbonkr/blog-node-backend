import { IAppOptions } from '../typings/IAppOptions';

export const appOptions: IAppOptions = {
    title: 'Blog Service',
    cookieDomain: '.bbon.me',
    corsOrigin: [
        'http://localhost:3000',
        'http://blog-service.bbon.me',
        'https://blog-service.bbon.me',
    ],
};
