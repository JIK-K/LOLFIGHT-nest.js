import { BaseEntity } from 'src/base/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Judgment } from './judgment.entity';
import { Member } from 'src/modules/member/entities/member.entity';

@Entity({
  name: 'judgment_vote',
  orderBy: {
    createdAt: 'DESC',
  },
})
@Unique(['judgment', 'member'])
export class JudgmentVote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Judgment, (judgment) => judgment.id, {
    onDelete: 'CASCADE',
  })
  judgment: Judgment;

  @ManyToOne(() => Member, (member) => member.id, {
    onDelete: 'CASCADE',
  })
  member: Member;

  @Column({ default: 'left' })
  voteSide: string;
}
