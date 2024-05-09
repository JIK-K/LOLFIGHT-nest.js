import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Battle } from './entities/battle.entity';
import { BattleTeam } from './entities/battle_team.entity';
import { BattlePlayer } from './entities/battle_player.entity';
import { BattleMapper } from './mapper/battle.mapper';
import { BattlePlayerMapper } from './mapper/battle_player.mapper';
import { BattleTeamMapper } from './mapper/battle_team.mapper';
import { GuildRecord } from '../guild/entities/guild_record.entity';
import { Guild } from '../guild/entities/guild.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Battle]),
    TypeOrmModule.forFeature([BattleTeam]),
    TypeOrmModule.forFeature([BattlePlayer]),
    TypeOrmModule.forFeature([Guild]),
    TypeOrmModule.forFeature([GuildRecord]),
  ],
  controllers: [BattleController],
  providers: [
    BattleService,
    BattleMapper,
    BattleTeamMapper,
    BattlePlayerMapper,
  ],
  exports: [BattleService, BattleMapper, BattleTeamMapper, BattlePlayerMapper],
})
export class BattleModule {}
