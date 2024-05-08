import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { BattleTeamDTO } from './battle_team.dto';

export class BattleDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  battleId: number;

  @IsOptional()
  battleMode: string;

  @IsOptional()
  battleLength: number;

  @IsOptional()
  teamA: BattleTeamDTO;

  @IsOptional()
  teamB: BattleTeamDTO;
}
