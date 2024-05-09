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
import { BattlePlayerDTO } from '../DTOs/battle_player.dto';
import { BattlePlayer } from './battle_player.entity';

@Entity({
  name: 'battle_team',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class BattleTeam extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'is_winning' })
  isWinning: boolean;

  @Column({ name: 'guild_name' })
  guildName: string;

  @OneToOne(() => BattlePlayer)
  @JoinColumn({ name: 'player1' })
  player1: BattlePlayer;

  @OneToOne(() => BattlePlayer)
  @JoinColumn({ name: 'player2' })
  player2: BattlePlayer;

  @OneToOne(() => BattlePlayer)
  @JoinColumn({ name: 'player3' })
  player3: BattlePlayer;

  @OneToOne(() => BattlePlayer)
  @JoinColumn({ name: 'player4' })
  player4: BattlePlayer;

  @OneToOne(() => BattlePlayer)
  @JoinColumn({ name: 'player5' })
  player5: BattlePlayer;
}
