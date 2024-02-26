import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildMapper } from './mapper/guild.mapper';
import { Member } from '../member/entities/member.entity';
import { MemberMapper } from '../member/mapper/member.mapper';
import { GuildRecord } from './entities/guild_record.entity';
import { GuildInvite } from './entities/guild_initve.entity';
import { GuildInviteMapper } from './mapper/guild_invite.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guild]),
    TypeOrmModule.forFeature([GuildRecord]),
    TypeOrmModule.forFeature([GuildInvite]),
    TypeOrmModule.forFeature([Member]),
  ],
  controllers: [GuildController],
  providers: [GuildService, GuildMapper, GuildInviteMapper, MemberMapper],
  exports: [GuildService, GuildMapper, GuildInviteMapper, MemberMapper],
})
export class GuildModule {}
