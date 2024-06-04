import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class MemberDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  gameName: string;

  @IsOptional()
  gameTier: string;

  @IsOptional()
  summonerId: number;
}
