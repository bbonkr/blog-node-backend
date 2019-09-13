import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { sequelizeConfig } from '../config/config';
import { IDatabaseConfigItem } from '../typings/IDatabaseConfigItem';
import { User } from './User.model';
import { Category } from './Category.model';
import { Post } from './Post.model';
import { Comment } from './Comment.model';
import { Image } from './Image.model';
import { PostAccessLog } from './PostAccessLog.model';
import { PostCategory } from './PostCategory.model';
import { PostImage } from './PostImage.model';
import { PostTag } from './PostTag.model';
import { Tag } from './Tag.model';
import { ResetPasswordCode } from './ResetPasswordCode.model';
import { UserLikePost } from './UserLikePost.model';
import { UserVerifyCode } from './UserVerifyCode.model';
import { Session } from '../passport/Session.model';

const env = process.env.NODE_ENV || 'development';
const config: IDatabaseConfigItem = sequelizeConfig[env];
const isTest = env === 'test';

const sequelizeOptions: SequelizeOptions = {
    ...config,
    models: [
        Session,
        User,
        Category,
        Post,
        Comment,
        Image,
        Tag,
        PostAccessLog,
        PostCategory,
        PostImage,
        PostTag,
        ResetPasswordCode,
        UserLikePost,
        UserVerifyCode,
    ],
    // logging?: boolean | ((sql: string, timing?: number) => void);
    // logging: (sql: string, timing?: number): void => {},
    logging: !isTest,
};

export const sequelize = new Sequelize(sequelizeOptions);
