export interface IHttpStatusError {
    name?: string;
    code?: number;
    message?: string;
    stack?: string;
    inner?: Error;
}

export class HttpStatusError implements Error {
    public name: string;
    public code: number;
    public message: string;
    public stack?: string;
    public inner?: Error;

    constructor(value: IHttpStatusError) {
        this.name = value.name || 'HttpStatusError';
        this.code = value.code || 500;
        this.message = value.message || 'An unknown error has occurred.';
        this.inner = value.inner || null;
        this.stack = value.inner ? value.inner.stack : null;
    }
}
