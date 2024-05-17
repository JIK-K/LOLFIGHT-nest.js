import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Battle } from '../entities/battle.entity';
import { BattleDTO } from '../DTOs/battle.dto';
import { BattleTeam } from '../entities/battle_team.entity';
import { BattleTeamDTO } from '../DTOs/battle_team.dto';

@Injectable()
export class BattleTeamMapper {
  constructor() {}

  toDTO(battleTeamEntity: BattleTeam): BattleTeamDTO {
    const {
      id,
      isWinning,
      point,
      guildName,
      player1,
      player2,
      player3,
      player4,
      player5,
    } = battleTeamEntity;

    return Builder<BattleTeamDTO>()
      .id(id)
      .isWinning(isWinning)
      .point(point)
      .guildName(guildName)
      .player1(player1)
      .player2(player2)
      .player3(player3)
      .player4(player4)
      .player5(player5)
      .build();
  }
}
