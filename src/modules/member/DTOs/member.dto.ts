import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Guild } from 'src/modules/guild/entities/guild.entity';

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
  memberPhone: string;

  @IsOptional()
  memberGuild: Guild;
}
