import { Body, Controller, Logger, Post } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberDTO } from './DTOs/member.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  private logger: Logger = new Logger();

  /**
   * Member생성
   * @param memberDTO
   * @returns
   */
  @Post()
  async postMember(
    @Body() memberDTO: MemberDTO,
  ): Promise<ResponseDTO<MemberDTO>> {
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.createMember(memberDTO),
    );
  }
}
