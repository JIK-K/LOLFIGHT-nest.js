import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberMapper } from './mapper/member.mapper';
import { Repository } from 'typeorm';
import { MemberDTO } from './DTOs/member.dto';
import * as bcrypt from 'bcrypt';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { Builder } from 'builder-pattern';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private memberMapper: MemberMapper,
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
    console.log(memberDTO);

    const memberEntity: Member = Builder<Member>()
      .id(memberDTO.id)
      .memberId(memberDTO.memberId)
      .memberPw(hashedPassword)
      .memberName(memberDTO.memberName)
      .memberPhone(memberDTO.memberPhone)
      .memberBirthDay(memberDTO.memberBirthDay)
      .memberGuild(memberDTO.memberGuild)
      .salt(salt)
      .build();

    return this.memberMapper.toDTO(
      await this.memberRepository.save(memberEntity),
    );
  }
}
