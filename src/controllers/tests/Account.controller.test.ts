import express from 'express';
import supertest from 'supertest';
import { getExpressApp } from './app';
import { JsonResult } from '../../typings/JsonResult';

let app: express.Application;

beforeAll(async () => {
    app = await getExpressApp();
});

afterAll(async () => {
    // avoid jest open handle error
    await new Promise(resolve => setTimeout(() => resolve(), 500));
});

describe('Account', () => {
    it('Join member', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(200);
    });

    it('Join member - should be HTTP400 Make sure username unique', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 Make sure email unique', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test1',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 username is required', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: '',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 displayName is required', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: '',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 email is required', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: '',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 password is required', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: '',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            });

        expect(response.status).toBe(400);
    });

    it('Join member - should be HTTP400 verifyEmailUrl is required', async () => {
        const response = await supertest(app)
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: '',
            });

        expect(response.status).toBe(400);
    });

    it('signin - success', async () => {
        const response = await supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test1234',
            });

        const { success, data, message } = response.body as JsonResult<any>;
        const { user, token } = data;
        expect(token.length || 0).not.toBe(0);
        expect(user.username).toBe('test');
    });

    it('signin - failure', async () => {
        const response = await supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: 'test',
            });

        const { success, data, message } = response.body as JsonResult<any>;
        expect(response.status).toBe(200);
        expect(success).toBe(false);
        expect(message).not.toBeNull();
    });

    it('signin - failure username required', async () => {
        const response = await supertest(app)
            .post('/api/account/signin')
            .send({
                username: '',
                password: 'test',
            });

        const { success, data, message } = response.body as JsonResult<any>;
        expect(response.status).toBe(200);
        expect(success).toBe(false);
        expect(message).not.toBeNull();
    });

    it('signin - failure  password required', async () => {
        const response = await supertest(app)
            .post('/api/account/signin')
            .send({
                username: 'test',
                password: '',
            });

        const { success, data, message } = response.body as JsonResult<any>;
        expect(response.status).toBe(200);
        expect(success).toBe(false);
        expect(message).not.toBeNull();
    });
});
