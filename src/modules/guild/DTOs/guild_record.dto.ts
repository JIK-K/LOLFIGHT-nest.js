import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class GuildRecordDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  recordLadder: number;

  @IsOptional()
  recordVictory: number;

  @IsOptional()
  recordDefeat: number;

  @IsOptional()
  recordRanking: string;
}
