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
      { secret: process.env.REFRESH_TOKEN_SECRET_KEY, expiresIn: '2w' }, // 2주 동안 유효한 refresh token
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
        14 * 24 * 60 * 60
      }; SameSite=Strict;`,
    );

    return;
  }

  //@todo 왜 나를 괴롭히는가
  getAdminAccessToken({ member }): String {
    return this.jwtService.sign(
      {
        id: member.memberId,
        admin: true,
      },
      {
        // secret: process.env.ACCESS_ADMIN_SECRET_KEY,
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
        expiresIn: '5m',
      },
    );
  }

  setAdminRefreshToken({ member, res }) {
    const refreshToken = this.jwtService.sign(
      { id: member.memberId, admin: true },
      {
        // secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        expiresIn: '2w',
      }, // 2주 동안 유효한 refresh token
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
        14 * 24 * 60 * 60
      }; SameSite=Strict;`,
    );

    return;
  }
}
