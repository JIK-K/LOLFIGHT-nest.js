import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Member } from 'src/modules/member/entities/member.entity';
import { Guild } from '../entities/guild.entity';

export class GuildInviteDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  memberId: Member;

  @IsOptional()
  guildId: Guild;
}
