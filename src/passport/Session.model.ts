import {
    Model,
    Table,
    Column,
    DataType,
    AllowNull,
} from 'sequelize-typescript';

@Table({
    modelName: 'Session',
    tableName: 'Sessions',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Session extends Model<Session> {
    @AllowNull(false)
    @Column(DataType.STRING(1000))
    public sid!: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    public sess!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    public expire!: Date;
}
