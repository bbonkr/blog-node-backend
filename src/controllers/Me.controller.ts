import { ControllerBase } from '../typings/ControllerBase';

export class MeController extends ControllerBase {
    public getPath(): string {
        return '/api/me';
    }
    protected initializeRoutes(): void {
        throw new Error('Method not implemented.');
    }
}
