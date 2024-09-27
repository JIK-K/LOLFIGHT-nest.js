import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    //주입받은 JWT Module의 서비스 이용
    private readonly jwtService: JwtService,
  ) {}

  //Access Token 발급
  getAccessToken({ member }): String {
    return this.jwtService.sign(
      {
        id: member.memberId,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
        expiresIn: '5m',
      },
    );
  }

  setRefreshToken({ member, res }) {
    const refreshToken = this.jwtService.sign(
      { id: member.memberId },
      { secret: process.env.REFRESH_TOKEN_SECRET_KEY, expiresIn: '2w' },
    );

    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
    return;
  }
}
