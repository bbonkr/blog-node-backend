import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
} from 'sequelize-typescript';

@Table({
    modelName: 'Post',
    tableName: 'Posts', // TODO 테이블 이름 확인
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
    public password: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isPinned: boolean;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isDeleted: boolean;

    @AllowNull(true)
    @Column(DataType.DATE)
    public deletedAt: Date;
}
