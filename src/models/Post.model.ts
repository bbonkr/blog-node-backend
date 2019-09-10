import {
    Model,
    Table,
    Column,
    Comment as ColumnComment,
    DataType,
    AllowNull,
    Unique,
    Default,
    BelongsToMany,
    HasMany,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Category } from './Category.model';
import { PostCategory } from './PostCategory.model';
import { Comment } from './Comment.model';
import { Image } from './Image.model';
import { PostImage } from './PostImage.model';
import { Tag } from './Tag.model';
import { PostTag } from './PostTag.model';
import { User } from './User.model';
import { UserLikePost } from './UserLikePost.model';
import { PostAccessLog } from './PostAccessLog.model';

@Table({
    modelName: 'Post',
    tableName: 'Posts',
    comment: '글',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Post extends Model<Post> {
    @AllowNull(false)
    @Column(DataType.STRING(500))
    public title!: string;

    @AllowNull(false)
    @Unique
    @Column(DataType.STRING(200))
    public slug!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    public markdown!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    public html!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    public text!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    public excerpt!: string;

    @AllowNull(true)
    @Column(DataType.STRING(500))
    public coverImage!: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isPublished!: boolean;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isPrivate!: string;

    @AllowNull(true)
    @Default(false)
    @Column(DataType.STRING(500))
    public password!: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isPinned!: boolean;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isDeleted!: boolean;

    @AllowNull(true)
    @Column(DataType.DATE)
    public deletedAt?: Date;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId!: number;

    @BelongsTo(() => User, { as: 'user', foreignKey: 'userId' })
    public user!: User;

    @BelongsToMany(() => Category, () => PostCategory)
    public categories!: Category[];

    @HasMany(() => Comment)
    public comments!: Comment[];

    @HasMany(() => PostAccessLog)
    public accessLogs!: PostAccessLog[];

    @BelongsToMany(() => Image, () => PostImage)
    public images!: Image[];

    @BelongsToMany(() => Tag, () => PostTag)
    public tags!: Tag[];

    @BelongsToMany(() => User, { through: () => UserLikePost, as: 'likers' })
    // @BelongsToMany(() => User, () => UserLikePost)
    public likers!: User[];
}
