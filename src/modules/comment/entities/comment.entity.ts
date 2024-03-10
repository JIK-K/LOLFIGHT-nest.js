import { BaseEntity } from 'src/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { Post } from '../../post/entities/post.entity';

@Entity({
  name: 'comment',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn({ name: 'post_id' })
  postId: number;

  @PrimaryColumn({ name: 'post_board_id' })
  postBoardId: string;

  @Column({ name: 'comment_content' })
  commentContent: string;

  @Column({ name: 'depth', default: 0 })
  depth: number;

  @Column({ name: 'orderNumber', default: 0 })
  orderNumber: number;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  @JoinColumn({ name: 'post_board_id', referencedColumnName: 'boardId' })
  post: Post;

  //   @ManyToOne(() => Post, (post) => post.boardId)
  //   @JoinColumn({ name: 'post_board_id' })
  //   postBoard: Post;
}
