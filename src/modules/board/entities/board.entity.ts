import { Entity, OneToMany, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { BaseEntity } from 'src/base/base.entity';

@Entity({
  name: 'board',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'board_type' })
  boardType: string;

  @OneToMany(() => Post, (post) => post.board)
  posts: Post[];
}
