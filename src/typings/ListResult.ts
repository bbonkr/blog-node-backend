import { Dictionary } from './Dictionary';

export interface ListResult<T> {
    records: T[];
    total: number;
}

export interface ListResultWithInformation<T> extends ListResult<T>, Dictionary<any> {}
