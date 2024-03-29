import { BaseEntity } from 'src/base/base.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuildRecord } from './guild_record.entity';

@Entity({
  name: 'guild',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Guild extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guild_master' })
  guildMaster: string;

  @Column({ name: 'guild_name' })
  guildName: string;

  @Column({ name: 'guild_members', default: 1 })
  guildMembers: number;

  @Column({ name: 'guild_description', nullable: true })
  guildDescription: string;

  @Column({ name: 'guild_tier', default: 'BRONZE' })
  guildTier: string;

  @Column({ name: 'guild_icon', nullable: true })
  guildIcon: string;

  @OneToMany(() => Member, (member) => member.memberGuild)
  members: Member[];

  @OneToOne(() => GuildRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_record' })
  guildRecord: GuildRecord;
}
