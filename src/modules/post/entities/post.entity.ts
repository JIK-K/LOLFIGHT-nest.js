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
import { Member } from 'src/modules/member/entities/member.entity';

@Entity({
  name: 'post',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ name: 'board_id' })
  boardId: string;

  @Column({ name: 'post_title' })
  postTitle: string;

  @Column({ name: 'post_content' })
  postContent: string;

  // @Column({ name: 'post_writer' })
  // postWriter: string;

  @Column({ name: 'post_views', default: 0 })
  postViews: number;

  @Column({ name: 'post_likes', default: 0 })
  postLikes: number;

  @Column({ name: 'post_comments', default: 0 })
  postComments: number;

  @Column({ name: 'deletedTrue', default: false })
  deletedTrue: boolean;

  @Column({ name: 'deletedAt', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Board, (board) => board.id)
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @ManyToOne(() => Member, (member) => member.id)
  @JoinColumn({ name: 'post_writer' })
  member: Member;
}
