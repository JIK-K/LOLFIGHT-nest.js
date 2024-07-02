import {
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
} from 'fs';
import { CommonUtil } from 'src/utils/common.util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MemberDTO } from '../member/DTOs/member.dto';
import { MemberMapper } from '../member/mapper/member.mapper';
import { GuildRecord } from './entities/guild_record.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GuildInviteDTO } from './DTOs/guild_invite.dto';
import { GuildInvite } from './entities/guild_initve.entity';
import { GuildInviteMapper } from './mapper/guild_invite.mapper';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    private guildMapper: GuildMapper,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private memberMapper: MemberMapper,
    @InjectRepository(GuildRecord)
    private guildRecordRepository: Repository<GuildRecord>,
    @InjectRepository(GuildInvite)
    private guildInviteRepository: Repository<GuildInvite>,
    private guildInviteMapper: GuildInviteMapper,
  ) {}

  /**
   * 길드 랭킹 업데이트
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async updateRanking() {
    const records = await this.guildRecordRepository.find({
      order: { recordLadder: 'DESC' },
    });

    let rank = 1;
    for (const record of records) {
      record.recordRanking = rank.toString();
      rank++;
    }

    await this.guildRecordRepository.save(records);
  }

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
      // const fileName = `${guildDTO.guildName}.${file.originalname
      //   .split('.')
      //   .pop()}`;
      const fileName = `${guildDTO.guildName}.png`;
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

    const guildRecordEntity: GuildRecord = Builder<GuildRecord>().build();

    await this.guildRecordRepository.save(guildRecordEntity);

    const guildEntity: Guild = Builder<Guild>()
      .id(guildDTO.id)
      .guildMaster(guildDTO.guildMaster)
      .guildName(guildDTO.guildName)
      .guildMembers(guildDTO.guildMembers)
      .guildDescription(guildDTO.guildDescription)
      .guildTier(guildDTO.guildTier)
      .guildIcon(guildIconPath)
      .guildRecord(guildRecordEntity)
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

  /**
   * Guild 길드 리스트
   * @returns
   */
  async getGuildList(): Promise<GuildDTO[]> {
    const guildEntites: Guild[] = await this.guildRepository
      .createQueryBuilder('guild')
      .leftJoinAndSelect('guild.guildRecord', 'guildRecord')
      .getMany();

    return this.guildMapper.toDTOList(guildEntites);
  }

  /**
   * Guild 정보 조회
   * @param guildName
   * @returns
   */
  async getGuildInfo(guildName: string): Promise<GuildDTO> {
    const guildEntity: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .leftJoinAndSelect('guild.guildRecord', 'guildRecord')
      .where('guild_name = :name', {
        name: guildName,
      })
      .getOne();

    if (!CommonUtil.isValid(guildEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    return await this.guildMapper.toDTO(guildEntity);
  }

  /**
   * guild 길드원 리스트
   * @param guildName
   * @returns
   */
  async getGuildMemberList(guildName: string): Promise<MemberDTO[]> {
    const memberEntities: Member[] = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.memberGame', 'memberGame')
      .where((subQuery) => {
        const subQueryAlias = subQuery
          .subQuery()
          .select('id')
          .from('Guild', 'guild')
          .where('guild.guild_name = :name', { name: guildName })
          .getQuery();
        return 'member.memberGuild IN ' + subQueryAlias;
      })
      .getMany();

    if (!CommonUtil.isValid(memberEntities) || !(memberEntities.length > 0)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    return await this.memberMapper.toDTOList(memberEntities);
  }

  /**
   * guild 길드원 추방
   * @param memberName
   * @param guildName
   * @returns
   */
  async expulsionGuildMember(memberName: string, guildName: string) {
    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .where('member_name = :name', {
        name: memberName,
      })
      .getOne();

    if (!memberEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const guildEntity: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .where('guild_name = :name', {
        name: guildName,
      })
      .getOne();

    if (!guildEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    guildEntity.guildMembers -= 1;
    await this.guildRepository.save(guildEntity);

    memberEntity.memberGuild = null;

    return this.memberMapper.toDTO(
      await this.memberRepository.save(memberEntity),
    );
  }

  /**
   * guild 해체
   * @param guildName
   * @returns
   */
  async deleteGuild(guildName: string): Promise<GuildDTO> {
    const guildEntity: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .leftJoinAndSelect('guild.guildRecord', 'guildRecord')
      .where('guild.guild_name = :name', { name: guildName })
      .getOne();

    if (!guildEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const publicFolderPath = path.join(__dirname, '../../..', 'public/guild');
    try {
      const files = await fs.readdir(publicFolderPath);
      for (const file of files) {
        if (file.startsWith(guildName + '.')) {
          const filePath = path.join(publicFolderPath, file);
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error(`Error deleting image files for ${guildName}:`, error);
    }

    if (guildEntity.guildRecord) {
      await this.guildRecordRepository.remove(guildEntity.guildRecord);
    }

    const removeData = await this.guildRepository.remove(guildEntity);
    return this.guildMapper.toDTO(removeData);
  }

  /**
   * Guild-Invite 길드 가입신청
   * @param guildInviteDTO
   * @returns
   */
  async addGuildInvite(guildInviteDTO: GuildInviteDTO) {
    const existInviteData = await this.guildInviteRepository
      .createQueryBuilder('guild_invite')
      .where('member_id = :memberId AND guild_id = :guildId', {
        memberId: guildInviteDTO.memberId,
        guildId: guildInviteDTO.guildId,
      })
      .getOne();

    if (existInviteData) {
      throw new HttpException(CODE_CONSTANT.EXIST_DATA, HttpStatus.BAD_REQUEST);
    }

    const existIncludeGuild = await this.memberRepository
      .createQueryBuilder('member')
      .where('id = :memberId AND member.memberGuild IS NOT NULL', {
        memberId: guildInviteDTO.memberId,
      })
      .getOne();

    if (existIncludeGuild) {
      throw new HttpException(CODE_CONSTANT.EXIST_DATA, HttpStatus.BAD_REQUEST);
    }

    const guildInviteEntity: GuildInvite = Builder<GuildInvite>()
      .id(guildInviteDTO.id)
      .memberId(guildInviteDTO.memberId)
      .guildId(guildInviteDTO.guildId)
      .build();

    return this.guildInviteMapper.toDTO(
      await this.guildInviteRepository.save(guildInviteEntity),
    );
  }

  /**
   * Guild-Invite 길드 가입신청 리스트
   * @param guildName
   * @returns
   */
  async getGuildInviteList(guildName: string) {
    const targetGuild: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .leftJoinAndSelect('guild.guildRecord', 'guildRecord')
      .where('guild_name = :name', {
        name: guildName,
      })
      .getOne();

    if (!CommonUtil.isValid(targetGuild)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const inviteEntities: GuildInvite[] = await this.guildInviteRepository
      .createQueryBuilder('guild_invite')
      .leftJoinAndSelect('guild_invite.memberId', 'member')
      .leftJoinAndSelect('guild_invite.guildId', 'guild')
      .leftJoinAndSelect('member.memberGame', 'memberGame')
      .where('guild_id = :id', {
        id: targetGuild.id,
      })
      .getMany();

    return this.guildInviteMapper.toDTOList(inviteEntities);
  }

  /**
   * Guild-Invite 길드 가입신청 수락
   * @param memberId
   * @param guildId
   * @returns
   */
  async inviteAccept(memberId: string, guildId: string) {
    const acceptEntity: GuildInvite = await this.guildInviteRepository
      .createQueryBuilder('guild_invite')
      .where('member_id = :memberId AND guild_id = :guildId', {
        memberId: memberId,
        guildId: guildId,
      })
      .getOne();

    if (!acceptEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const removeEntity: GuildInvite[] = await this.guildInviteRepository
      .createQueryBuilder('guild_invite')
      .where('member_id = :memberId', {
        memberId: memberId,
      })
      .getMany();

    await this.guildInviteRepository.remove(removeEntity);

    const inviteGuild: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .where('id = :guildId', {
        guildId: guildId,
      })
      .getOne();

    if (!inviteGuild) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    inviteGuild.guildMembers += 1;
    await this.guildRepository.save(inviteGuild);

    const inviteMember: Member = await this.memberRepository
      .createQueryBuilder('member')
      .where('id = :memberId', {
        memberId: memberId,
      })
      .getOne();

    if (!inviteMember) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    inviteMember.memberGuild = inviteGuild;
    return this.memberMapper.toDTO(
      await this.memberRepository.save(inviteMember),
    );
  }

  /**
   * Guild-Invite 길드 가입신청 거절
   * @param memberId
   * @param guildId
   * @returns
   */
  async inviteReject(memberId: string, guildId: string) {
    const inviteEntity: GuildInvite = await this.guildInviteRepository
      .createQueryBuilder('guild_invite')
      .where('member_id = :memberId AND guild_id = :guildId', {
        memberId: memberId,
        guildId: guildId,
      })
      .getOne();

    if (!inviteEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    return this.guildInviteMapper.toDTO(
      await this.guildInviteRepository.remove(inviteEntity),
    );
  }
}
