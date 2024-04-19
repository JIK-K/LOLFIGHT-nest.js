import { BaseEntity } from 'src/base/base.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';
import { Member } from 'src/modules/member/entities/member.entity';

@Entity({
  name: 'post_like',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class PostLike extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Post, (post) => post.id)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  @JoinColumn({ name: 'post_board_id', referencedColumnName: 'boardId' })
  post: Post;

  @ManyToOne(() => Member, (member) => member.id)
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
