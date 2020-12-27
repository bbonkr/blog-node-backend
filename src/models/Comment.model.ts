import { User } from './User.model';
import { Post } from './Post.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ModelBsae } from './ModelBase';

// @Table({
//     modelName: 'Comment',
//     tableName: 'Comments',
//     comment: '댓글',
//     timestamps: true,
//     charset: 'utf8mb4',
//     collate: 'utf8mb4_general_ci',
// })
@Entity({ name: 'Comments' })
export class Comment extends ModelBsae {
  //   @ColumnComment('마크다운')
  //   @AllowNull(false)
  //   @Column(DataType.TEXT)
  @Column({ type: 'text', nullable: false, comment: '마크다운 문서' })
  public markdown!: string;

  //   @ColumnComment('html')
  //   @AllowNull(false)
  //   @Column(DataType.TEXT)
  @Column({ type: 'text', nullable: false, comment: 'HTML 문서' })
  public html!: string;

  //   @ColumnComment('텍스트')
  //   @AllowNull(false)
  //   @Column(DataType.TEXT)
  @Column({ type: 'text', nullable: false, comment: '텍스트 문서' })
  public text!: string;

  //   @AllowNull(false)
  //   @ForeignKey(() => User)
  //   @Column(DataType.INTEGER)
  //   public userId!: number;

  //   @BelongsTo(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  public user!: User;

  //   @AllowNull(false)
  //   @ForeignKey(() => Post)
  //   @Column(DataType.INTEGER)
  //   public postId!: number;

  //   @BelongsTo(() => Post)
  @ManyToOne(() => Post, (post) => post.comments)
  public post!: Post;
}
