import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  getAccessToken({ member }): string {
    return this.jwtService.sign(
      {
        phone: member.memberPhone,
        id: member.memberId,
      },
      {
        secret: process.env.ACCESS_TOKEN_SECRET_KEY,
        expiresIn: '5m',
      },
    );
  }

  setAccessToken({ member, res }) {
    const refreshToken = this.jwtService.sign(
      {
        phone: member.memberPhone,
        id: member.memberId,
      },
      {
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        expiresIn: '5m',
      },
    );
    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`); //Client Cookie에 저장
    return;
  }
}
