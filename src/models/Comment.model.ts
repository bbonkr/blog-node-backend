import {
    Model,
    Table,
    Column,
    Comment as ColumnComment,
    DataType,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from './User.model';
import { Post } from './Post.model';

@Table({
    modelName: 'Comment',
    tableName: 'Comments',
    comment: '댓글',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Comment extends Model<Comment> {
    @ColumnComment('마크다운')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public markdown!: string;

    @ColumnComment('html')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public html!: string;

    @ColumnComment('텍스트')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public text!: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId!: number;

    @BelongsTo(() => User)
    public user!: User;

    @AllowNull(false)
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId!: number;

    @BelongsTo(() => Post)
    public post!: Post;
}
