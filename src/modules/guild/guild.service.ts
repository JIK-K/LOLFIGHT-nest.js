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
        .pop()}`; // 파일 이름 설정
      const filePath = join(__dirname, '../../..', 'public/guild', fileName); // 파일 경로 설정
      if (existsSync(filePath)) {
        // 파일이 이미 존재하는 경우 삭제
        rmSync(filePath);
      }

      // 파일 스트림 생성
      const readStream = createReadStream(file.path);
      const writeStream = createWriteStream(filePath);

      // 파일 복사
      readStream.pipe(writeStream);

      // 파일 복사 완료 후에는 파일 스트림을 닫습니다.
      writeStream.on('finish', () => {
        // 파일 삭제
        unlinkSync(file.path);

        guildIconPath = `public/guild/${fileName}`; // 파일의 경로를 guildIconPath에 저장
      });
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
