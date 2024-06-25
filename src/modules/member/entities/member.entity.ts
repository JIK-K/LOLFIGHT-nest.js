import { BaseEntity } from 'src/base/base.entity';
import { Guild } from 'src/modules/guild/entities/guild.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberGame } from './member_game.entity';

@Entity({
  name: 'member',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column({ name: 'member_pw' })
  memberPw: string;

  @Column({ name: 'member_name' })
  memberName: string;

  @ManyToOne(() => Guild, (guild) => guild.members, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'member_guild' })
  memberGuild: Guild;

  @OneToOne(() => MemberGame, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'member_game' })
  memberGame: MemberGame;

  @Column()
  salt: string;
}
