import { BaseEntity, Entity, OneToMany } from 'typeorm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';

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
  postType: string;

  @OneToMany(() => Post, (post) => post.board)
  posts: Post[];
}
