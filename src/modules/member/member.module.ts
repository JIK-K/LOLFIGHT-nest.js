import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { MemberMapper } from './mapper/member.mapper';
import { JwtModule } from '@nestjs/jwt';
import { MemberGame } from './entities/member_game.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Member]),
    TypeOrmModule.forFeature([MemberGame]),
  ],
  controllers: [MemberController],
  providers: [MemberService, MemberMapper],
  exports: [MemberService, MemberMapper],
})
export class MemberModule {}
