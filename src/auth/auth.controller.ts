import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { MemberService } from 'src/modules/member/member.service';
import { AuthService } from './auth.service';
import { AuthDTO } from './DTOs/auth.dto';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { AuthGuard } from '@nestjs/passport';
import { MemberDTO } from 'src/modules/member/DTOs/member.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {}
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

  @Post('/login')
  async login(@Body() authDTO: AuthDTO, @Res() res: Response) {
    const { id, pw } = authDTO;
    const member = await this.memberService.loginMember(id, pw);
    if (!member) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    if (member.memberId === process.env.ADMIN_ID) {
      this.authService.setAdminRefreshToken({ member, res });

      const jwt = this.authService.getAdminAccessToken({ member });
      return res.status(200).send(jwt);
    } else {
      this.authService.setRefreshToken({ member, res });

      const jwt = this.authService.getAccessToken({ member });
      return res.status(200).send(jwt);
    }
  }

  // 로그아웃 엔드포인트
  @Post('/logout')
  async logout(@Res() res: Response) {
    // Refresh Token 삭제 (쿠키에서 제거)
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/', // 쿠키의 경로 설정
    });
    // 로그아웃 성공 응답
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  @UseGuards(AuthGuard('refresh'))
  @Post('/refresh')
  async refresh(@Res() res: Response, @Body() body: any) {
    const member = await this.memberService.findMember(body.id);

    if (member.memberId === process.env.ADMIN_ID) {
      const newAdminToken = this.authService.getAdminAccessToken({ member });
      return res.status(200).send({ accessToken: newAdminToken });
    } else {
      // 새로운 Access Token 발급
      const newAccessToken = this.authService.getAccessToken({ member });

      return res.status(200).send({ accessToken: newAccessToken });
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() body: { email: string }, @Res() res: Response) {
    const member = await this.memberService.findMember(body.email);

    if (!member) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.NOT_FOUND);
    }

    const newAccessToken = this.authService.getAccessToken({ member });

    return res.status(200).send({ accessToken: newAccessToken });
  }
}
