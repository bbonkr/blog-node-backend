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
    BelongsToMany,
} from 'sequelize-typescript';
import { User } from './User.model';
import { Post } from './Post.model';
import { PostCategory } from './PostCategory.model';

@Table({
    modelName: 'Category',
    tableName: 'Categories',
    comment: '분류',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Category extends Model<Category> {
    @Comment('이름')
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public name!: string;

    @Comment('슬러그')
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public slug!: string;

    @Comment('출력순서')
    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER)
    public ordinal!: number;

    // TODO 관계
    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId: number;

    @BelongsTo(() => User)
    public user!: User;

    @BelongsToMany(() => Post, () => PostCategory)
    public posts!: Post[];
}
