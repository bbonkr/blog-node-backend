import express = require('express');
import { IControllerBase } from './IControllerBase';

export abstract class ControllerBase implements IControllerBase {
    protected readonly router: express.Router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    public abstract getPath(): string;

    public getRouter(): express.Router {
        return this.router;
    }

    protected abstract initializeRoutes(): void;
}
