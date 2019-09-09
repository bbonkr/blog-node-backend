import { User as UserModel } from '../models/User.model';

declare global {
    namespace Express {
        export interface User {
            id: number;
            username: string;
        }

        export interface Request {
            user?: User;
            userInfo?: UserModel;
        }
    }
}
