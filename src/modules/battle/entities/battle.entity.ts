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
import { BattleTeam } from './battle_team.entity';

@Entity({
  name: 'battle',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class Battle extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'battle_id' })
  battleId: number;

  @Column({ name: 'battle_Mode' })
  battleMode: string;

  @Column({ name: 'battle_Length' })
  battleLength: number;

  @OneToOne(() => BattleTeam, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_A' })
  teamA: BattleTeam;

  @OneToOne(() => BattleTeam, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_B' })
  teamB: BattleTeam;
}
