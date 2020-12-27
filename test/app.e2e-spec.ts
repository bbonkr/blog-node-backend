import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Movie } from 'src/movies/entities/movie.entiry';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdMovie: Movie;

  const EMPTY_MOVIE_ID = 'no movie id';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Welcome to movie api');
  });

  describe('/movies', () => {
    it('GET', () => {
      return request(app.getHttpServer()).get('/movies').expect(200);
    });

    it('POST 201', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'test',
          year: 2020,
          genres: ['test'],
        })
        .expect(201)
        .then((res) => {
          createdMovie = res.body;
        });
    });

    it('POST 400', () => {
      return request(app.getHttpServer())
        .post('/movies')
        .send({
          title: 'test',
          year: 2020,
          genres: ['test'],
          oops: 'not ok',
        })
        .expect(400);
    });
  });

  describe('/movies/:id', () => {
    it('GET 200', () => {
      return request(app.getHttpServer())
        .get(`/movies/${createdMovie.id}`)
        .expect(200);
    });
    it('GET 404', () => {
      return request(app.getHttpServer())
        .get(`/movies/${EMPTY_MOVIE_ID}`)
        .expect(404);
    });

    it('PATCH 200', () => {
      return request(app.getHttpServer())
        .patch(`/movies/${createdMovie.id}`)
        .send({
          year: 2019,
        })
        .expect(200);
    });
    it('PATCH 404', () => {
      return request(app.getHttpServer())
        .patch(`/movies/${EMPTY_MOVIE_ID}`)
        .send({
          year: 2019,
        })
        .expect(404);
    });
    it('PATCH 400', () => {
      return request(app.getHttpServer())
        .patch(`/movies/${EMPTY_MOVIE_ID}`)
        .send({
          year: 2019,
          oops: 'not ok',
        })
        .expect(400);
    });

    it('DELETE 200', () => {
      return request(app.getHttpServer())
        .delete(`/movies/${createdMovie.id}`)
        .expect(200);
    });
    it('DELETE 404', () => {
      return request(app.getHttpServer())
        .delete(`/movies/${EMPTY_MOVIE_ID}`)
        .expect(404);
    });
  });

  describe('/movies/search', () => {
    it('GET 200', () => {
      return request(app.getHttpServer())
        .get(`/movies/search?year=2020`)
        .expect(200);
    });
  });
});
