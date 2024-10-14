import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Judgment } from '../entities/judgment.entity';
import { Member } from 'src/modules/member/entities/member.entity';

export class JudgmentVoteDTO extends BaseDTO {
  @IsOptional()
  id: number;
  @IsOptional()
  judgmentId: Judgment;
  @IsOptional()
  memberId: Member;
  @IsOptional()
  voteSide: string;
}
