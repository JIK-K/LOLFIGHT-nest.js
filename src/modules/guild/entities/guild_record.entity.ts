import { BaseEntity } from 'src/base/base.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Guild } from './guild.entity';

@Entity({
  name: 'guild_record',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class GuildRecord extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'record_ladder', default: 1200 })
  recordLadder: number;

  @Column({ name: 'record_victory', default: 0 })
  recordVictory: number;

  @Column({ name: 'record_defeat', default: 0 })
  recordDefeat: number;

  @Column({ name: 'record_ranking', default: '기록없음' })
  recordRanking: string;

  @OneToOne(() => Guild, (guild) => guild.guildRecord, { onDelete: 'CASCADE' })
  guild: Guild;
}
