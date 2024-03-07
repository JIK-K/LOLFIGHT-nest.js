import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { GuildRecord } from '../entities/guild_record.entity';
import { GuildRecordDTO } from './guild_record.dto';

export class GuildDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  guildMaster: string;

  @IsOptional()
  guildName: string;

  @IsOptional()
  guildMembers: number;

  @IsOptional()
  guildDescription: string;

  @IsOptional()
  guildTier: string;

  @IsOptional()
  guildIcon: string;

  @IsOptional()
  guildRecord: GuildRecordDTO;
}
