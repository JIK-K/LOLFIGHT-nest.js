import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  async login(@Body() authDTO: AuthDTO, @Res() res: Response) {
    const { id, pw } = authDTO;
    const member = await this.memberService.loginMember(id, pw);
    if (!member) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    this.authService.setRefreshToken({ member, res });

    const jwt = this.authService.getAccessToken({ member });
    console.log(jwt);
    return res.status(200).send(jwt);
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
    const member = this.memberService.findMember(body.id);

    // 새로운 Access Token 발급
    const newAccessToken = this.authService.getAccessToken({ member });

    return res.status(200).send({ accessToken: newAccessToken });
  }
}
