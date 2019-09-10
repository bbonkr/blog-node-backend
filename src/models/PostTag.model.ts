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
import { Tag } from './Tag.model';

@Table({
    modelName: 'PostTag',
    tableName: 'PostTag',
    comment: '글-태그',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class PostTag extends Model<PostTag> {
    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId!: number;

    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Tag)
    @Column(DataType.INTEGER)
    public tagId!: number;
}
