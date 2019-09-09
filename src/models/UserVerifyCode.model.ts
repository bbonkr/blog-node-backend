import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
    PrimaryKey,
    ForeignKey,
} from 'sequelize-typescript';

@Table({
    modelName: 'UserVerifyCode',
    tableName: 'UserVerifyCodes', // TODO 테이블 이름 확인
    comment: '전자우편 확인 코드',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class UserVerifyCode extends Model<UserVerifyCode> {
    @AllowNull(false)
    @Column(DataType.STRING(200))
    public email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public code!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    public expire!: Date;
}
