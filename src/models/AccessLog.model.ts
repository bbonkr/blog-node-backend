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

@Table({
    modelName: 'AccessLog',
    tableName: 'AccessLogs',
    comment: '접근 로그',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Category extends Model<Category> {
    @Comment('경로')
    @AllowNull(false)
    @Column(DataType.STRING(500))
    public path!: string;

    @AllowNull(true)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId: number;

    @BelongsTo(() => User)
    public user!: User;
}
