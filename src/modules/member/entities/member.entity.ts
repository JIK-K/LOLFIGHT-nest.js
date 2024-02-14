import { BaseEntity } from 'src/base/base.entity';
import { Guild } from 'src/modules/guild/entities/guild.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ name: 'member_phone', nullable: true })
  memberPhone: string;

  @ManyToOne(() => Guild, (guild) => guild.members, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'member_guild' })
  memberGuild: Guild;

  @Column()
  salt: string;
}
