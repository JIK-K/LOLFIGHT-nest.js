import {
  Body,
  Controller,
  Get,
  Patch,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberDTO } from './DTOs/member.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { CommonUtil } from 'src/utils/common.util';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  private logger: Logger = new Logger();

  /**
   * Member 생성
   * @param memberDTO
   * @returns
   */
  @Post()
  async create(@Body() memberDTO: MemberDTO): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Create Member : ${memberDTO}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.createMember(memberDTO),
    );
  }

  /**
   * Member 로그인
   * @param id
   * @param pw
   * @returns
   */
  @Get('/login')
  async login(
    @Query('id') id: string,
    @Query('pw') pw: string,
  ): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Login Member ID:${id} PW:${pw}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.loginMember(id, pw),
    );
  }

  /**
   * Member id로 찾기
   * @param id
   * @returns
   */
  @Get('/find')
  async find(@Query('id') id: string): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Find Member Id : ${id}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.findMember(id),
    );
  }

  /**
   * Member 길드 탈퇴
   * @param id
   * @returns
   */
  @Patch('/leave')
  async leaveGuild(@Query('id') id: string): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Leave Guild Member ${id}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.leaveMember(id),
    );
  }

  /**
   * Member 업데이트
   * @param memberDTO
   * @returns
   */
  @Patch()
  async update(@Body() memberDTO: MemberDTO): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Update Member ${memberDTO.memberName}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.updateMember(memberDTO),
    );
  }

  /**
   * Member 삭제
   * @param id
   * @returns
   */
  @Delete()
  async remove(@Query('id') id: string): Promise<ResponseDTO<MemberDTO>> {
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.deleteMember(id),
    );
  }

  // @UseGuards(AuthGuard('access'))
  // @Get('/login')
  // async loginMember(
  //   @Query('id') id: string,
  //   @Query('pw') pw: string,
  //   @Res() res: Response
  // ): Promise<void> {
  //   this.logger.log(`Login Member ID:${id} PW:${pw}`);
  //   const findMember = await this.memberService.loginMember(id, pw);
  //   if (CommonUtil.isValid(findMember)) {
  //     this.authService.setAccessToken({ member: findMember, res });
  //     const token = this.authService.getAccessToken({ member: findMember });
  //     res.status(HttpStatus.OK).send(token);
  //   }
  // }

  // @UseGuards(AuthGuard('refresh'))
  // @Post('refresh')
  // async restoreAccessToken(@Req() req: Request & { member: MemberDTO }) {
  //   return this.authService.getAccessToken({ member: req.member });
  // }
}
