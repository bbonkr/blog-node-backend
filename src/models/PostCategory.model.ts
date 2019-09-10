import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Default,
    ForeignKey,
    BelongsTo,
    PrimaryKey,
} from 'sequelize-typescript';
import { Post } from './Post.model';
import { Category } from './Category.model';

@Table({
    modelName: 'PostCategory',
    tableName: 'PostCategory',
    comment: '글-분류',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class PostCategory extends Model<PostCategory> {
    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId: number;

    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Category)
    @Column(DataType.INTEGER)
    public categoryId!: number;
}
