import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Default,
} from 'sequelize-typescript';

@Table({
    modelName: 'Category',
    tableName: 'Categories', // TODO 테이블 이름 확인
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
}
