import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET_KEY,
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
