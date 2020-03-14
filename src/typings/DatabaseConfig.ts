import { DatabaseConfigItem } from './DatabaseConfigItem';
import { Dictionary } from './Dictionary';

/**
 * 데이터베이스 연결 구성 환경 변수별
 */
// export interface IDatabaseConfig {
//     [environment: string]: IDatabaseConfigItem;
// }

export interface DatabaseConfig extends Dictionary<DatabaseConfigItem> {}
