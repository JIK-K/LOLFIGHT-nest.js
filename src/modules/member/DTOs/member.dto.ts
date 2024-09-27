import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Guild } from 'src/modules/guild/entities/guild.entity';
import { MemberGame } from '../entities/member_game.entity';

export class MemberDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  memberId: string;

  @IsOptional()
  memberPw: string;

  @IsOptional()
  memberName: string;

  @IsOptional()
  memberIcon: string;

  @IsOptional()
  memberGuild: Guild;

  @IsOptional()
  memberGame: MemberGame;
}
