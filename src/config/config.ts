import dotenv from 'dotenv';
import { DatabaseConfig } from '../typings/DatabaseConfig';

dotenv.config();

export const sequelizeConfig: DatabaseConfig = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
    test: {
        dialect: 'sqlite',
        storage: ':memory:',
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
};
