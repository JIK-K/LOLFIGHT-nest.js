import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class BattlePlayerDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  championId: number;

  @IsOptional()
  summonerName: string;

  @IsOptional()
  detectedTeamPosition: string;

  @IsOptional()
  items: string;

  @IsOptional()
  spell1Id: number;

  @IsOptional()
  spell2Id: number;

  @IsOptional()
  killed: number;

  @IsOptional()
  deaths: number;

  @IsOptional()
  assists: number;

  @IsOptional()
  gold: number;

  @IsOptional()
  level: number;

  @IsOptional()
  minionsKilled: number;

  @IsOptional()
  totalDamage: number;

  @IsOptional()
  totalChampionsDamage: number;

  @IsOptional()
  visionScore: number;

  @IsOptional()
  perk0: number;
  @IsOptional()
  perk1: number;
  @IsOptional()
  perk2: number;
  @IsOptional()
  perk3: number;
  @IsOptional()
  perk4: number;
  @IsOptional()
  perk5: number;
}
