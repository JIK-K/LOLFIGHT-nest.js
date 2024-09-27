import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MemberService } from 'src/modules/member/member.service';
import { AuthService } from './auth.service';
import { AuthDTO } from './DTOs/auth.dto';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';

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
    return res.status(200).send(jwt);
  }
}
