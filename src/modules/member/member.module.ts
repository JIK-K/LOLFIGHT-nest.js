import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberMapper } from './mapper/member.mapper';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Member])],
  controllers: [MemberController],
  providers: [MemberService, MemberMapper, AuthService],
  exports: [MemberService, MemberMapper],
})
export class MemberModule {}
