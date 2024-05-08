import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { BattlePlayerDTO } from './battle_player.dto';

export class BattleTeamDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  isWinning: boolean;

  @IsOptional()
  guildName: string;

  @IsOptional()
  player1: BattlePlayerDTO;

  @IsOptional()
  player2: BattlePlayerDTO;

  @IsOptional()
  player3: BattlePlayerDTO;

  @IsOptional()
  player4: BattlePlayerDTO;

  @IsOptional()
  player5: BattlePlayerDTO;
}
