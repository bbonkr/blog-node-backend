# Blog Backend

[NodeBlog](https://github.com/bbonkr/nodeblog) 저장소에서 백엔드와 프론트엔드를 분리합니다.

TypeScript로 작성하며, Nodejs 로 실행합니다.

## Stack

-   [Nodejs](https://nodejs.org)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Express](https://expressjs.com/ko/)
-   [Passport](http://www.passportjs.org/)
-   [Sequelize](https://sequelize.org/)
-   [MariaDB](https://mariadb.org/)

## Features

Express 기반의 웹 응용프로그램을 구현합니다.

Passport 로 인증을 구현하고, JWT 를 사용합니다.

Sequelize 로 ORM을 사용하고, 대상 데이터베이스는 MariaDB를 사용합니다.

## ERD

![ERD](./erd/blog.png)

> 다이어그램은 [vuerd-front](https://github.com/vuerd/vuerd-front) 로 작성되었습니다.

## Docker

도커 이미지를 빌드합니다.

```bash
$ docker build --tag bbonkr/blog-service-backend:1.0.0 .
```

환경 변수

> .env.sample 파일 참조

-   SITE_NAME
-   COOKIE_SECRET
-   JWT_SECRET
-   JWT_ISSUER
-   JWT_AUDIENCE
-   DB_HOST
-   DB_PORT
-   DB_DATABASE
-   DB_USERNAME
-   DB_PASSWORD
