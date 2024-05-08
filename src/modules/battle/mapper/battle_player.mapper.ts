import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { BattlePlayer } from '../entities/battle_player.entity';
import { BattlePlayerDTO } from '../DTOs/battle_player.dto';

@Injectable()
export class BattlePlayerMapper {
  constructor() {}

  toDTO(battlePlayerEntity: BattlePlayer): BattlePlayerDTO {
    const {
      id,
      championId,
      summonerName,
      detectedTeamPosition,
      items,
      spell1Id,
      spell2Id,
      killed,
      deaths,
      assists,
      gold,
      level,
      minionsKilled,
      totalDamage,
      totalChampionsDamage,
      visionScore,
      perk0,
      perk1,
      perk2,
      perk3,
      perk4,
      perk5,
    } = battlePlayerEntity;

    return Builder<BattlePlayerDTO>()
      .id(id)
      .championId(championId)
      .summonerName(summonerName)
      .detectedTeamPosition(detectedTeamPosition)
      .items(items)
      .spell1Id(spell1Id)
      .spell2Id(spell2Id)
      .killed(killed)
      .deaths(deaths)
      .assists(assists)
      .gold(gold)
      .level(level)
      .minionsKilled(minionsKilled)
      .totalDamage(totalDamage)
      .totalChampionsDamage(totalChampionsDamage)
      .visionScore(visionScore)
      .perk0(perk0)
      .perk1(perk1)
      .perk2(perk2)
      .perk3(perk3)
      .perk4(perk4)
      .perk5(perk5)
      .build();
  }
}
