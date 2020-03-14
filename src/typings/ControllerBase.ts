import express from 'express';
import { HttpStatusError } from './HttpStatusError';

interface Controller {
    getPath(): string;
    getRouter(): express.Router;
}

export abstract class ControllerBase implements Controller {
    protected readonly router: express.Router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public abstract getPath(): string;

    public getRouter(): express.Router {
        return this.router;
    }

    protected getOffset(total: number, page: number = 1, limit: number = 10): number {
        return (page - 1) * limit;
    }

    protected validateRequired(value: string, message: string) {
        if (!value || value.trim().length === 0) {
            throw new HttpStatusError({
                code: 400,
                message: message,
            });
        }
    }

    protected abstract initializeRoutes(): void;
}
