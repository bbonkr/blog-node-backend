import {
    Model,
    Table,
    Column,
    Comment as ColumnComment,
    DataType,
    AllowNull,
} from 'sequelize-typescript';

@Table({
    modelName: 'Comment',
    tableName: 'Comments', // TODO 테이블 이름 확인
    comment: '댓글',
    timestamps: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
})
export class Comment extends Model<Comment> {
    @ColumnComment('마크다운')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public markdown!: string;

    @ColumnComment('html')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public html!: string;

    @ColumnComment('텍스트')
    @AllowNull(false)
    @Column(DataType.TEXT)
    public text!: string;
}
