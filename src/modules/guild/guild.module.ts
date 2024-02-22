import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildMapper } from './mapper/guild.mapper';
import { Member } from '../member/entities/member.entity';
import { MemberMapper } from '../member/mapper/member.mapper';
import { GuildRecord } from './entities/guild_record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guild]),
    TypeOrmModule.forFeature([GuildRecord]),
    TypeOrmModule.forFeature([Member]),
  ],
  controllers: [GuildController],
  providers: [GuildService, GuildMapper, MemberMapper],
  exports: [GuildService, GuildMapper, MemberMapper],
})
export class GuildModule {}
