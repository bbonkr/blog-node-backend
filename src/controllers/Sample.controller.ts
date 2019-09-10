import express from 'express';
import { ControllerBase } from '../typings/ControllerBase';
import { JsonResult } from '../typings/JsonResult';

export class SampleController extends ControllerBase {
    public getPath(): string {
        return '/api/account';
    }

    protected initializeRoutes(): void {
        this.router.get('/', this.get);
    }

    private get(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): any {
        try {
            return res.json(
                new JsonResult({
                    success: true,
                    data: 'OK',
                }),
            );
        } catch (err) {
            return next(err);
        }
    }
}
