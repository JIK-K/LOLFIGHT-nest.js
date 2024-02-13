import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildMapper } from './mapper/guild.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Guild])],
  controllers: [GuildController],
  providers: [GuildService, GuildMapper],
  exports: [GuildService, GuildMapper],
})
export class GuildModule {}
