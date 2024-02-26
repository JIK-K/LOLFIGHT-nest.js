import { BaseEntity } from 'src/base/base.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from './guild.entity';

@Entity({
  name: 'guild_invite',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class GuildInvite extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member, (member) => member.id)
  @JoinColumn({ name: 'member_id' })
  memberId: Member;

  @ManyToOne(() => Guild, (guild) => guild.id)
  @JoinColumn({ name: 'guild_id' })
  guildId: Guild;
}
