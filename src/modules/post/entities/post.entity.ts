import { BaseEntity } from 'src/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';

@Entity({
  name: 'post',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  boardId: number;

  @Column({ name: 'post_title' })
  postTitle: string;

  @Column({ name: 'post_content' })
  postContent: string;

  @Column({ name: 'post_writer' })
  postWriter: string;

  @Column({ name: 'post_date' })
  postDate: string;

  @Column({ name: 'post_views', default: 0 })
  postViews: number;

  @Column({ name: 'post_likes', default: 0 })
  postLikes: number;

  @Column({ name: 'post_comments', default: 0 })
  postComments: number;

  @ManyToOne(() => Board, (board) => board.id)
  @JoinColumn({ name: 'boardId' })
  board: Board;
}
