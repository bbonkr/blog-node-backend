export interface IJsonResult<T> {
    success: boolean;
    data?: T | T[] | null;
    message?: string;
}
