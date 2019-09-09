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
import { Image } from './Image.model';

@Table({
    modelName: 'PostImage',
    tableName: 'PostImage', // TODO 테이블 이름 확인
    comment: '첨부파일',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class PostImage extends Model<PostImage> {
    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Post)
    @Column(DataType.INTEGER)
    public postId!: number;

    @AllowNull(false)
    @PrimaryKey
    @ForeignKey(() => Image)
    @Column(DataType.INTEGER)
    public imageId!: number;
}
