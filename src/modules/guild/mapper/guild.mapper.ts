import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Guild } from '../entities/guild.entity';
import { GuildDTO } from '../DTOs/guild.dto';

@Injectable()
export class GuildMapper {
  constructor() {}

  toDTO(guildEntity: Guild): GuildDTO {
    const {
      id,
      guildMaster,
      guildName,
      guildMembers,
      guildDescription,
      guildTier,
      guildIcon,
      guildRecord,
      createdAt,
      updatedAt,
    } = guildEntity;

    return Builder<GuildDTO>()
      .id(id)
      .guildMaster(guildMaster)
      .guildName(guildName)
      .guildMembers(guildMembers)
      .guildDescription(guildDescription)
      .guildTier(guildTier)
      .guildIcon(guildIcon)
      .guildRecord(guildRecord)
      .createAt(createdAt)
      .updateAt(updatedAt)
      .build();
  }

  toDTOList(guildEntites: Guild[]): GuildDTO[] {
    const guildDTOList = [];
    guildEntites.forEach((guildEntity) =>
      guildDTOList.push(this.toDTO(guildEntity)),
    );

    return guildDTOList;
  }
}
