import { Injectable } from '@nestjs/common';
import { Member } from '../entities/member.entity';
import { MemberDTO } from '../DTOs/member.dto';
import { Builder } from 'builder-pattern';

@Injectable()
export class MemberMapper {
  constructor() {}

  toDTO(memberEntity: Member): MemberDTO {
    const {
      id,
      memberId,
      memberPw,
      memberName,
      memberPhone,
      memberBirthDay,
      memberGuild,
    } = memberEntity;

    return Builder<MemberDTO>()
      .id(id)
      .memberId(memberId)
      .memberPw(memberPw)
      .memberName(memberName)
      .memberPhone(memberPhone)
      .memberBirthDay(memberBirthDay)
      .memberGuild(memberGuild)
      .build();
  }

  toDTOList(memberEntites: Member[]): MemberDTO[] {
    const memberDTOList = [];
    memberEntites.forEach((memberEntity) =>
      memberDTOList.push(this.toDTO(memberEntity)),
    );

    return memberDTOList;
  }
}
