import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Guild } from '../entities/guild.entity';
import { GuildRecord } from '../entities/guild_record.entity';
import { GuildRecordDTO } from '../DTOs/guild_record.dto';

@Injectable()
export class GuildRecordMapper {
  constructor() {}

  toDTO(guildRecordEntity: GuildRecord): GuildRecordDTO {
    const { id, recordVictory, recordDefeat, recordLadder, recordRanking } =
      guildRecordEntity;

    return Builder<GuildRecordDTO>()
      .id(id)
      .recordVictory(recordVictory)
      .recordDefeat(recordDefeat)
      .recordLadder(recordLadder)
      .recordRanking(recordRanking)
      .build();
  }
}
