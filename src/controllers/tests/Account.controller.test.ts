import express from 'express';
import { App } from '../../app';
import supertest from 'supertest';
import { IJsonResult } from '../../typings/IJsonResult';
import { getExpressApp } from './app';

let app: express.Application;

beforeAll(async () => {
    // const serverApp = new App(3000);
    // await serverApp.initializeExpress();
    // app = serverApp.getExpressApp();
    app = await getExpressApp();
});

afterAll(() => {
    // 데이터 초기화
    supertest(app).removeAllListeners();
});

describe('Account', () => {
    it('Join member', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(200);
            });
    });

    it('Join member - should be HTTP400 Make sure username unique', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 Make sure email unique', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test1',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 username is required', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: '',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 displayName is required', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: '',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 email is required', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: '',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 password is required', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: '',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('Join member - should be HTTP400 verifyEmailUrl is required', () => {
        return supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: '',
            })
            .then((response) => {
                expect(response.status).toBe(400);
            });
    });

    it('signin - success', () => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test1234',
            })
            .then((response) => {
                const { success, data } = response.body as IJsonResult<any>;
                const { user, token } = data;
                expect(token.length || 0).not.toBe(0);
                expect(user.username).toBe('test');
            });
    });

    it('signin - failure', () => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test',
            })
            .then((response) => {
                expect(response.status).toBe(401);
            });
    });

    it('signin - failure username required', () => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: '',
                password: 'test',
            })
            .then((response) => {
                expect(response.status).toBe(401);
            });
    });

    it('signin - failure  password required', () => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: '',
            })
            .then((response) => {
                expect(response.status).toBe(401);
            });
    });
});
