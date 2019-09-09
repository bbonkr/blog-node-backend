import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
    PrimaryKey,
    ForeignKey,
} from 'sequelize-typescript';
import { Post } from './Post.model';
import { User } from './User.model';

@Table({
    modelName: 'UserLikePost',
    tableName: 'UserLikePosts', // TODO 테이블 이름 확인
    comment: '글-좋아요',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class UserLikePost extends Model<UserLikePost> {
    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId!: number;

    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId!: number;
}
