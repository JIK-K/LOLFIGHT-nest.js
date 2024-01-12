import { Module } from '@nestjs/common';
import { JwtAccess } from './jwtAccess.auth';
import { JwtRefresh } from './jwtRefresh.auth';

@Module({
  imports: [],
  providers: [JwtAccess, JwtRefresh],
  exports: [JwtAccess, JwtRefresh],
})
export class AuthModule {}
