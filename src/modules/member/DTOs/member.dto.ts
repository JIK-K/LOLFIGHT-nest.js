import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class MemberDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  memberId: string;

  @IsOptional()
  memberPw: string;

  @IsOptional()
  memberName: string;

  @IsOptional()
  memberPhone: string;

  @IsOptional()
  memberBirthDay: string;

  @IsOptional()
  memberGuild: string;
}
