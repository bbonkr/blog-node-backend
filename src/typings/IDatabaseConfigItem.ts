import { Dialect } from 'sequelize/types';

/**
 * 데이터베이스 연결 구성
 */
export interface IDatabaseConfigItem {
    host: string;
    username: string;
    password: string;
    database: string;
    port: number;
    dialect: Dialect;
}
