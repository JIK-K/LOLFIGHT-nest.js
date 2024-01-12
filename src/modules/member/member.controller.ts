import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberDTO } from './DTOs/member.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { AuthService } from '../auth/auth.service';
import { CommonUtil } from 'src/utils/common.util';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('member')
export class MemberController {
  constructor(
    private memberService: MemberService,
    private authService: AuthService,
  ) {}

  private logger: Logger = new Logger();

  /**
   * Member생성
   * @param memberDTO
   * @returns
   */
  @Post()
  async createMember(
    @Body() memberDTO: MemberDTO,
  ): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Create Member : ${memberDTO}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.createMember(memberDTO),
    );
  }

  @Get('/login')
  async loginMember(
    @Query('id') id: string,
    @Query('pw') pw: string,
  ): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Login Member ID:${id} PW:${pw}`);
    return ResponseUtil.makeSuccessResponse(
      await this.memberService.loginMember(id, pw),
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
