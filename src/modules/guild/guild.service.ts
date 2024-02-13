import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Guild } from './entities/guild.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMapper } from './mapper/guild.mapper';
import { GuildDTO } from './DTOs/guild.dto';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { Builder } from 'builder-pattern';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    private guildMapper: GuildMapper,
  ) {}

  async createGuild(guildDTO: GuildDTO): Promise<GuildDTO> {
    const existGuildData = await this.guildRepository
      .createQueryBuilder('guild')
      .where('guild.guild_name = :name OR guild.guild_master = :master', {
        name: guildDTO.guildName,
        master: guildDTO.guildMaster,
      })
      .getOne();

    if (existGuildData) {
      throw new HttpException(CODE_CONSTANT.EXIST_DATA, HttpStatus.BAD_REQUEST);
    }

    const guildEntity: Guild = Builder<Guild>()
      .id(guildDTO.id)
      .guildMaster(guildDTO.guildMaster)
      .guildName(guildDTO.guildName)
      .guildMembers(guildDTO.guildMembers)
      .guildDescription(guildDTO.guildDescription)
      .guildTier(guildDTO.guildTier)
      .guildIcon(guildDTO.guildIcon)
      .build();

    return this.guildMapper.toDTO(await this.guildRepository.save(guildEntity));
  }
}
