import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.cookies['refreshToken'];
        return cookie;
      },
      secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    });
  }

  validate(payload) {
    console.log(payload);
    if (payload.admin) {
      return {
        id: payload.id,
        admin: true,
      };
    } else {
      return {
        id: payload.id,
      };
    }
  }
}
