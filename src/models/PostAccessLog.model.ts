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
    modelName: 'PostAccessLog',
    tableName: 'PostAccessLogs', // TODO 테이블 이름 확인
    comment: '글 접근 로그',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class PostAccessLog extends Model<PostAccessLog> {
    @AllowNull(false)
    @Column(DataType.STRING(100))
    public ipAddress!: string;

    @AllowNull(false)
    @Column(DataType.STRING(500))
    public userAgent!: string;

    @AllowNull(true)
    @Column(DataType.INTEGER)
    public userId: number;
}
