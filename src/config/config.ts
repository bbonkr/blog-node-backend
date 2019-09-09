import dotenv from 'dotenv';
import { IDatabaseConfig } from '../typings/IDatabaseConfig';

dotenv.config();

export const sequelizeConfig: IDatabaseConfig = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialect: 'mariadb',
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
