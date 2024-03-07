import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberMapper } from './mapper/member.mapper';
import { Repository } from 'typeorm';
import { MemberDTO } from './DTOs/member.dto';
import * as bcrypt from 'bcrypt';
import { Builder } from 'builder-pattern';
import { CommonUtil } from 'src/utils/common.util';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { MemberGame } from './entities/member_game.entity';
import { Guild } from '../guild/entities/guild.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private memberMapper: MemberMapper,
    @InjectRepository(MemberGame)
    private memberGameRepository: Repository<MemberGame>,
    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
  ) {}

  /**
   * Member생성
   * @param memberDTO
   * @returns
   */
  async createMember(memberDTO: MemberDTO): Promise<MemberDTO> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(memberDTO.memberPw, salt);
    const existMemberData = await this.memberRepository
      .createQueryBuilder('member')
      .where('member_id = :id', {
        id: memberDTO.memberId,
      })
      .orWhere('member_name = :name', {
        name: memberDTO.memberName,
      })
      .getOne();

    if (existMemberData) {
      throw new HttpException(CODE_CONSTANT.EXIST_DATA, HttpStatus.BAD_REQUEST);
    }

    const memberEntity: Member = Builder<Member>()
      .id(memberDTO.id)
      .memberId(memberDTO.memberId)
      .memberPw(hashedPassword)
      .memberName(memberDTO.memberName)
      .memberGuild(memberDTO.memberGuild)
      .salt(salt)
      .build();

    return this.memberMapper.toDTO(
      await this.memberRepository.save(memberEntity),
    );
  }

  /**
   * Member 로그인
   * @param id
   * @param pw
   * @returns
   */
  async loginMember(id: string, pw: string): Promise<MemberDTO> {
    if (!CommonUtil.isValid(id)) {
      throw new HttpException(
        CODE_CONSTANT.NO_REQUIRED_DATA,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!CommonUtil.isValid(pw)) {
      throw new HttpException(
        CODE_CONSTANT.NO_REQUIRED_DATA,
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .where('member_id = :id', {
        id: id,
      })
      .getOne();

    if (!CommonUtil.isValid(memberEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(pw, memberEntity.salt);
    if (hashedPassword === memberEntity.memberPw) {
      return this.memberMapper.toDTO(memberEntity);
    }
  }

  /**
   * Member 업데이트
   * @param memberDTO
   * @returns
   */
  async updateMember(memberDTO: MemberDTO): Promise<MemberDTO> {
    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .where('member_id = :id', {
        id: memberDTO.memberId,
      })
      .getOne();

    console.log(memberDTO);
    console.log(memberEntity);

    if (!CommonUtil.isValid(memberEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    if (CommonUtil.isValid(memberDTO.memberName)) {
      memberEntity.memberName = memberDTO.memberName;
    }
    if (CommonUtil.isValid(memberDTO.memberGuild)) {
      memberEntity.memberGuild = memberDTO.memberGuild;
    }
    if (CommonUtil.isValid(memberDTO.memberPw)) {
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const hashedPassword = await bcrypt.hash(memberDTO.memberPw, salt);
      memberEntity.memberPw = hashedPassword;
      memberEntity.salt = salt;
    }
    if (CommonUtil.isValid(memberDTO.memberGame)) {
      const existGameData: MemberGame = await this.memberGameRepository
        .createQueryBuilder('member_game')
        .where('game_name = :name', {
          name: memberDTO.memberGame.gameName,
        })
        .getOne();

      if (!existGameData) {
        const memberGameEntity: MemberGame = Builder<MemberGame>()
          .id(memberDTO.memberGame.id)
          .gameName(memberDTO.memberGame.gameName)
          .gameTier(memberDTO.memberGame.gameTier)
          .build();

        await this.memberGameRepository.save(memberGameEntity);
        memberEntity.memberGame = memberGameEntity;
      }
    }

    return this.memberMapper.toDTO(
      await this.memberRepository.save(memberEntity),
    );
  }

  /**
   * Member 길드 탈퇴
   * @param id
   * @returns
   */
  async leaveMember(id: string): Promise<MemberDTO> {
    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.memberGuild', 'guild')
      .where('member_id = :id', {
        id: id,
      })
      .getOne();

    if (!CommonUtil.isValid(memberEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const memberGuild: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .where('guild_name = :name', {
        name: memberEntity.memberGuild.guildName,
      })
      .getOne();

    memberGuild.guildMembers -= 1;
    await this.guildRepository.save(memberGuild);

    memberEntity.memberGuild = null;

    return this.memberMapper.toDTO(
      await this.memberRepository.save(memberEntity),
    );
  }

  /**
   * Member find
   * @param id
   * @returns
   */
  async findMember(id: string): Promise<MemberDTO> {
    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.memberGuild', 'guild')
      .leftJoinAndSelect('member.memberGame', 'member_game')
      .where('member_id = :id', {
        id: id,
      })
      .getOne();

    if (!CommonUtil.isValid(memberEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    return await this.memberMapper.toDTO(memberEntity);
  }

  /**
   * Member 삭제
   * @param id
   * @returns
   */
  async deleteMember(id: string): Promise<MemberDTO> {
    const memberEntity: Member = await this.memberRepository
      .createQueryBuilder('member')
      .where('member_id = :id', {
        id: id,
      })
      .getOne();

    if (!CommonUtil.isValid(memberEntity)) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const removeData = await this.memberRepository.remove(memberEntity);
    return this.memberMapper.toDTO(removeData);
  }
}
