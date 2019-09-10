import {
    Model,
    Table,
    Column,
    Comment,
    DataType,
    AllowNull,
    Unique,
    Default,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from './User.model';

@Table({
    modelName: 'ResetPasswordCode',
    tableName: 'ResetPasswordCodes', // TODO 테이블 이름 확인
    comment: '비밀번호 변경 요청 코드',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class ResetPasswordCode extends Model<ResetPasswordCode> {
    @AllowNull(false)
    @Column(DataType.STRING(200))
    public email!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public code!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public password!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    public expired!: Date;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    public userId!: number;

    @BelongsTo(() => User)
    public user!: User;
}
