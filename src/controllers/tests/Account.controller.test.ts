import { App } from '../../app';
import supertest from 'supertest';

let app: App;

beforeAll(async () => {
    app = new App(3000);
    await app.initializeExpress();
});

afterAll(() => {
    // 데이터 초기화
});

describe('Account', () => {
    it('Join member', (done) => {
        return supertest(app.getExpressApp())
            .post('/api/account/register')
            .send({
                username: 'test',
                displayName: 'test user',
                email: 'test@bbon.me',
                password: 'test1234',
                verifyEmailUrl: 'http://localhost:3000/verifyemail',
            })
            .then((response) => {
                console.log('response body: ', response.body);
                expect(response.status).toBe(200);
                done();
            });
    });
    // test('signin', () => {});
    // test('password change', () => {});
});
