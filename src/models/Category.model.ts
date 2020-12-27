import { User } from './User.model';
import { Post } from './Post.model';
import { PostCategory } from './PostCategory.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ModelBsae } from './ModelBase';

// @Table({
//   modelName: 'Category',
//   tableName: 'Categories',
//   comment: '분류',
//   timestamps: true,
//   charset: 'utf8mb4',
//   collate: 'utf8mb4_general_ci',
// })
@Entity({ name: 'Categories' })
export class Category extends ModelBsae {
  //   @Comment('이름')
  //   @AllowNull(false)
  //   @Column(DataType.STRING(100))
  @Column({ type: 'varchar', length: 100, nullable: false, comment: '이름' })
  public name!: string;

  //   @Comment('슬러그')
  //   @AllowNull(false)
  //   @Column(DataType.STRING(100))
  @Column({ type: 'varchar', length: 100, nullable: false, comment: '슬러그' })
  public slug!: string;

  //   @Comment('출력순서')
  //   @AllowNull(false)
  //   @Default(1)
  //   @Column(DataType.INTEGER)
  @Column({ type: 'int', nullable: false, default: 1, comment: '출력순서' })
  public ordinal!: number;

  //   @AllowNull(false)
  //   @ForeignKey(() => User)
  //   @Column(DataType.INTEGER)
  //   public userId: number;
  //   @BelongsTo(() => User)
  @ManyToOne(() => User, (user) => user.categories)
  public user!: User;

  //   @BelongsToMany(() => Post, () => PostCategory)
  @ManyToOne(() => Post, (post) => post.categories)
  public posts!: Post[];
}
