import { IDatabaseConfigItem } from './IDatabaseConfigItem';
import { IDictionary } from './IDictionary';

/**
 * 데이터베이스 연결 구성 환경 변수별
 */
// export interface IDatabaseConfig {
//     [environment: string]: IDatabaseConfigItem;
// }

export interface IDatabaseConfig extends IDictionary<IDatabaseConfigItem> {}
