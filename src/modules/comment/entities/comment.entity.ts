import { BaseEntity } from 'src/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Member } from 'src/modules/member/entities/member.entity';

@Entity({
  name: 'comment',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id' })
  postId: number;

  @Column({ name: 'post_board_id' })
  postBoardId: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column({ name: 'comment_content' })
  commentContent: string;

  @Column({ name: 'depth', default: 0 })
  depth: number;

  @Column({ name: 'orderNumber', default: 0 })
  orderNumber: number;

  @Column({ name: 'deletedTrue', default: false })
  deletedTrue: boolean;

  @Column({ name: 'deletedAt', nullable: true })
  deletedAt: Date;

  @Column({ name: 'isCommentForComment', default: false })
  isCommentForComment: boolean;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  @JoinColumn({ name: 'post_board_id', referencedColumnName: 'boardId' })
  post: Post;

  @ManyToOne(() => Member, (member) => member.id)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Comment, (comment) => comment.id)
  @JoinColumn({ name: 'parent_comment_id', referencedColumnName: 'id' })
  parentComment: Comment;

  //   @ManyToOne(() => Post, (post) => post.boardId)
  //   @JoinColumn({ name: 'post_board_id' })
  //   postBoard: Post;
}
