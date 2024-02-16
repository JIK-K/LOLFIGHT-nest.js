import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Guild } from './entities/guild.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMapper } from './mapper/guild.mapper';
import { GuildDTO } from './DTOs/guild.dto';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { Builder } from 'builder-pattern';
import { Member } from '../member/entities/member.entity';
import { join } from 'path';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'fs';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    private guildMapper: GuildMapper,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  /**
   * guild 생성
   * @param guildDTO
   * @returns
   */
  async createGuild(
    guildDTO: GuildDTO,
    file?: Express.Multer.File,
  ): Promise<GuildDTO> {
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

    let guildIconPath: string | undefined; // 파일이 저장될 경로

    if (file) {
      const fileName = `${guildDTO.guildName}.${file.originalname
        .split('.')
        .pop()}`;
      const filePath = join(__dirname, '../../..', 'public/guild', fileName);
      if (existsSync(filePath)) {
        rmSync(filePath);
      }

      const readStream = createReadStream(file.path);
      const writeStream = createWriteStream(filePath);

      readStream.pipe(writeStream);
      writeStream.on('finish', () => {
        unlinkSync(file.path);
        guildIconPath = `public/guild/${fileName}`;
      });

      guildIconPath = `public/guild/${fileName}`;
    }

    const guildEntity: Guild = Builder<Guild>()
      .id(guildDTO.id)
      .guildMaster(guildDTO.guildMaster)
      .guildName(guildDTO.guildName)
      .guildMembers(guildDTO.guildMembers)
      .guildDescription(guildDTO.guildDescription)
      .guildTier(guildDTO.guildTier)
      .guildIcon(guildIconPath)
      .build();

    const createdGuild = this.guildMapper.toDTO(
      await this.guildRepository.save(guildEntity),
    );

    const guildMasterMember = await this.memberRepository.findOne({
      where: { memberName: guildDTO.guildMaster },
    });

    guildMasterMember.memberGuild = guildEntity;
    await this.memberRepository.save(guildMasterMember);

    return createdGuild;
  }
}
