import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Post } from './Post.model';

@Table({
    modelName: 'PostAccessLog',
    tableName: 'PostAccessLogs',
    comment: '글 접근 로그',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class PostAccessLog extends Model<PostAccessLog> {
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public ipAddress!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public userAgent!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    public userId: number;

    @AllowNull(false)
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId: number;

    @BelongsTo(() => Post)
    public post!: Post;
}
