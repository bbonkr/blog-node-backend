import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
    BelongsToMany,
} from 'sequelize-typescript';
import { Post } from './Post.model';
import { PostTag } from './PostTag.model';

@Table({
    modelName: 'Tag',
    tableName: 'Tags', // TODO 테이블 이름 확인
    comment: '태그',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Tag extends Model<Tag> {
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public name!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    public slug!: string;

    @BelongsToMany(() => Post, () => PostTag)
    public posts!: Post[];
}
