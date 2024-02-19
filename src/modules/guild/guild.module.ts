import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildMapper } from './mapper/guild.mapper';
import { Member } from '../member/entities/member.entity';
import { MemberMapper } from '../member/mapper/member.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guild]),
    TypeOrmModule.forFeature([Member]),
  ],
  controllers: [GuildController],
  providers: [GuildService, GuildMapper, MemberMapper],
  exports: [GuildService, GuildMapper, MemberMapper],
})
export class GuildModule {}
