import { IDictionary } from './IDictionary';

export interface IListResult<T> {
    records: T[];
    total: number;
}

export interface IListResultWithInformation<T>
    extends IListResult<T>,
        IDictionary<any> {}
