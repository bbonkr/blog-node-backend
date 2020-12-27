import { Category } from './Category.model';
import { Comment } from './Comment.model';
import { Image } from './Image.model';
import { Post } from './Post.model';
import { UserLikePost } from './UserLikePost.model';
import { UserVerifyCode } from './UserVerifyCode.model';
import { ResetPasswordCode } from './ResetPasswordCode.model';
import { Entity, Column, OneToMany } from 'typeorm';
import { ModelBsae } from './ModelBase';

// @Table({
//   modelName: 'User',
//   tableName: 'Users', // TODO 테이블 이름 확인
//   comment: '사용자',
//   timestamps: true,
//   charset: 'utf8mb4',
//   collate: 'utf8mb4_general_ci',
// })
@Entity({ name: 'Users' })
export class User extends ModelBsae {
  //   @AllowNull(false)
  //   @Column(DataType.STRING(100))
  @Column({ type: 'varchar', length: 100, nullable: false })
  public username!: string;

  //   @AllowNull(false)
  //   @Column(DataType.STRING(100))
  @Column({ type: 'varchar', length: 100, nullable: false })
  public displayName!: string;

  //   @AllowNull(false)
  //   @Column(DataType.STRING(200))
  @Column({ type: 'varchar', length: 200, nullable: false })
  public email!: string;

  //   @AllowNull(false)
  //   @Column(DataType.STRING(500))
  @Column({ type: 'varchar', length: 500, nullable: false })
  public password!: string;

  //   @AllowNull(false)
  //   @Default(false)
  //   @Column(DataType.BOOLEAN)
  @Column({ type: 'boolean', nullable: false, default: false })
  public isEmailConfirmed!: boolean;

  //   @AllowNull(true)
  //   @Column(DataType.STRING(500))
  @Column({ type: 'varchar', length: 500, nullable: true })
  public photo?: string;

  //   @HasMany(() => Category)
  @OneToMany(() => Category, (category) => category.user)
  public categories!: Category[];

  @HasMany(() => Comment)
  public comments!: Comment[];

  @HasMany(() => Image)
  public images!: Image[];

  @HasMany(() => Post)
  public posts!: Post[];

  @BelongsToMany(() => Post, {
    through: () => UserLikePost,
    as: 'likedPosts',
  })
  public likedPosts: Post[];

  @HasMany(() => UserVerifyCode)
  public verifyCodes: UserVerifyCode[];

  @HasMany(() => ResetPasswordCode)
  public resetPasswordCodes: ResetPasswordCode[];
}
