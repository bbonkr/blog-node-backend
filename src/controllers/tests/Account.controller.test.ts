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
    it('Join member', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 Make sure username unique', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 Make sure email unique', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 username is required', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 displayName is required', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 email is required', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 password is required', (done) => {
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
                done();
            });
    });

    it('Join member - should be HTTP400 verifyEmailUrl is required', (done) => {
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
                done();
            });
    });

    it('signin - success', (done) => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test1234',
            })
            .then((response) => {
                const { success, data, message } = response.body as IJsonResult<
                    any
                >;
                const { user, token } = data;
                expect(token.length || 0).not.toBe(0);
                expect(user.username).toBe('test');
                done();
            });
    });

    it('signin - failure', (done) => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test',
            })
            .then((response) => {
                const { success, data, message } = response.body as IJsonResult<
                    any
                >;
                expect(response.status).toBe(200);
                expect(success).toBe(false);
                expect(message).not.toBeNull();

                done();
            });
    });

    it('signin - failure username required', (done) => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: '',
                password: 'test',
            })
            .then((response) => {
                const { success, data, message } = response.body as IJsonResult<
                    any
                >;
                expect(response.status).toBe(200);
                expect(success).toBe(false);
                expect(message).not.toBeNull();

                done();
            });
    });

    it('signin - failure  password required', (done) => {
        return supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: '',
            })
            .then((response) => {
                const { success, data, message } = response.body as IJsonResult<
                    any
                >;
                expect(response.status).toBe(200);
                expect(success).toBe(false);
                expect(message).not.toBeNull();

                done();
            });
    });
});
