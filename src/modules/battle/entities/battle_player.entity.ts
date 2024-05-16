import { BaseEntity } from 'src/base/base.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BattleTeam } from './battle_team.entity';

@Entity({
  name: 'battle_player',
  orderBy: {
    createdAt: 'DESC',
  },
})
export class BattlePlayer extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //   @ManyToOne(() => BattleTeam, (team) => team.id)
  //   @JoinColumn({ name: 'team_id' })
  //   team: BattleTeam;

  @Column({ name: 'champion_id' })
  championId: number;

  @Column({ name: 'summoner_name' })
  summonerName: string;

  @Column({ name: 'detected_team_position' })
  detectedTeamPosition: string;

  @Column({ name: 'items' })
  items: string;

  @Column({ name: 'spell_1_id' })
  spell1Id: number;

  @Column({ name: 'spell_2_id' })
  spell2Id: number;

  @Column({ name: 'killed' })
  killed: number;

  @Column({ name: 'deaths' })
  deaths: number;

  @Column({ name: 'assists' })
  assists: number;

  @Column({ name: 'gold_earned' })
  gold: number;

  @Column({ name: 'level' })
  level: number;

  @Column({ name: 'minions_killed' })
  minionsKilled: number;

  @Column({ name: 'total_damage' })
  totalDamage: number;

  @Column({ name: 'total_champions_damage' })
  totalChampionsDamage: number;

  @Column({ name: 'vision_score' })
  visionScore: number;

  @Column({ name: 'perk0' })
  perk0: number;
  @Column({ name: 'perk1' })
  perk1: number;
  @Column({ name: 'perk2' })
  perk2: number;
  @Column({ name: 'perk3' })
  perk3: number;
  @Column({ name: 'perk4' })
  perk4: number;
  @Column({ name: 'perk5' })
  perk5: number;

  @Column({ name: 'perk_sub' })
  perkSub: number;
}
