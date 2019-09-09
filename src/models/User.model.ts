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
    modelName: 'User',
    tableName: 'Users', // TODO 테이블 이름 확인
    comment: '사용자',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class User extends Model<User> {
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public username!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    public displayName!: string;

    @AllowNull(false)
    @Column(DataType.STRING(200))
    public email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public password!: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    public isEmailConfirmed!: boolean;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public photo!: string;
}
