import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Guild } from '../entities/guild.entity';
import { GuildRecord } from '../entities/guild_record.entity';
import { GuildRecordDTO } from '../DTOs/guild_record.dto';
import { GuildInvite } from '../entities/guild_initve.entity';
import { GuildInviteDTO } from '../DTOs/guild_invite.dto';

@Injectable()
export class GuildInviteMapper {
  constructor() {}

  toDTO(guildInviteEntity: GuildInvite): GuildInviteDTO {
    const { id, memberId, guildId } = guildInviteEntity;

    return Builder<GuildInviteDTO>()
      .id(id)
      .memberId(memberId)
      .guildId(guildId)
      .build();
  }

  toDTOList(guildInviteEntites: GuildInvite[]): GuildInvite[] {
    const guildInviteDTOList = [];
    guildInviteEntites.forEach((guildInviteEntity) =>
      guildInviteDTOList.push(this.toDTO(guildInviteEntity)),
    );

    return guildInviteDTOList;
  }
}
