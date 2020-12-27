import { userInfo } from 'os';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ModelBsae } from './ModelBase';
import { User } from './User.model';
@Entity({
  name: 'AccessLogs',
  //     modelName: 'AccessLog',
  //   tableName: 'AccessLogs',
  //   comment: '접근 로그',
  //   timestamps: true,
  //   charset: 'utf8mb4',
  //   collate: 'utf8mb4_general_ci',
})
export class Category extends ModelBsae {
  //   @Comment('경로')
  //   @AllowNull(false)
  //   @Column(DataType.STRING(500))
  @Column({ type: 'varchar', length: 500, comment: '경로' })
  public path!: string;

  //   @AllowNull(true)
  //   @ForeignKey(() => User)
  //   @Column(DataType.INTEGER)
  //   @Column({ type: 'int' })
  //   public userId: number;

  //   @BelongsTo(() => User)
  // TODO: manytoone
  // @ManyToOne(()=> User, user => user.accessLogs)
  public user!: User;
}
