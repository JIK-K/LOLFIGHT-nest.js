import { BaseEntity } from 'src/base/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ name: 'guild_tier', default: '브론즈' })
  guildTier: string;

  @Column({ name: 'guild_icon', nullable: true })
  guildIcon: string;
}
