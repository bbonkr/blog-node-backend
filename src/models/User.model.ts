import {
    Model,
    Table,
    Column,
    Comment as ColumnComment,
    DataType,
    AllowNull,
    Unique,
    Default,
    HasMany,
    BelongsToMany,
} from 'sequelize-typescript';
import { Category } from './Category.model';
import { Comment } from './Comment.model';
import { Image } from './Image.model';
import { Post } from './Post.model';
import { UserLikePost } from './UserLikePost.model';
import { UserVerifyCode } from './UserVerifyCode.model';
import { ResetPasswordCode } from './ResetPasswordCode.model';

@Table({
    modelName: 'User',
    tableName: 'Users', // TODO 테이블 이름 확인
    comment: '사용자',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class User extends Model<User> {
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public username!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    public displayName!: string;

    @AllowNull(false)
    @Column(DataType.STRING(200))
    public email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public password!: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isEmailConfirmed!: boolean;

    @AllowNull(true)
    @Column(DataType.STRING(500))
    public photo?: string;

    @HasMany(() => Category)
    public categories!: Category[];

    @HasMany(() => Comment)
    public comments!: Comment[];

    @HasMany(() => Image)
    public images!: Image[];

    @HasMany(() => Post)
    public posts!: Post[];

    @BelongsToMany(() => Post, {
        through: () => UserLikePost,
        as: 'likedPosts',
    })
    public likedPosts: Post[];

    @HasMany(() => UserVerifyCode)
    public verifyCodes: UserVerifyCode[];

    @HasMany(() => ResetPasswordCode)
    public resetPasswordCodes: ResetPasswordCode[];
}
