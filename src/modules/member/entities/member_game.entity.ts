import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './member.entity';

@Entity({
  name: 'member_game',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class MemberGame extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'game_name' })
  gameName: string;

  @Column({ name: 'game_tier' })
  gameTier: string;

  @Column({ name: 'game_summonerId' })
  summonerId: number;

  @OneToOne(() => Member, (member) => member.memberGame, {
    onDelete: 'CASCADE',
  })
  member: Member;
}
