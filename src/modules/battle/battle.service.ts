import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Battle } from './entities/battle.entity';
import { Repository } from 'typeorm';
import { BattleTeam } from './entities/battle_team.entity';
import { BattlePlayer } from './entities/battle_player.entity';
import { BattleDTO } from './DTOs/battle.dto';
import { Builder } from 'builder-pattern';
import { BattleTeamDTO } from './DTOs/battle_team.dto';
import { BattlePlayerDTO } from './DTOs/battle_player.dto';
import { BattleMapper } from './mapper/battle.mapper';
import { BattleTeamMapper } from './mapper/battle_team.mapper';
import { BattlePlayerMapper } from './mapper/battle_player.mapper';
import { Guild } from '../guild/entities/guild.entity';
import { GuildRecord } from '../guild/entities/guild_record.entity';

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(Battle) private battleRepository: Repository<Battle>,
    private battleMapper: BattleMapper,
    @InjectRepository(BattleTeam)
    private battleTeamRepository: Repository<BattleTeam>,
    private battleTeamMapper: BattleTeamMapper,
    @InjectRepository(BattlePlayer)
    private battlePlayerRepository: Repository<BattlePlayer>,
    private battlePlayerMapper: BattlePlayerMapper,

    @InjectRepository(Guild) private guildRepository: Repository<Guild>,
    @InjectRepository(GuildRecord)
    private guildRecordRepository: Repository<GuildRecord>,
  ) {}

  /**
   * Battle 결과 생성
   * @param battleDTO
   * @returns
   */
  async createBattle(battleDTO: BattleDTO): Promise<string> {
    return '테스트';
    // 팀 A 엔티티 생성 및 저장
    const teamAEntity: BattleTeam = await this.createBattleTeam(
      battleDTO.teamA,
    );
    // 팀 B 엔티티 생성 및 저장
    const teamBEntity: BattleTeam = await this.createBattleTeam(
      battleDTO.teamB,
    );

    // 전투 엔티티 생성
    const battleEntity: Battle = Builder<Battle>()
      .id(battleDTO.id)
      .battleId(battleDTO.battleId)
      .battleMode(battleDTO.battleMode)
      .battleLength(battleDTO.battleLength)
      .teamA(teamAEntity)
      .teamB(teamBEntity)
      .build();

    //Guild Record 최신화
    const teamAGuildEntity: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .where('guild.guildName = :guildName', {
        guildName: battleDTO.teamA.guildName,
      })
      .getOne();
    const teamAGuildRecordEntity: GuildRecord = await this.guildRecordRepository
      .createQueryBuilder('guild_record')
      .leftJoinAndSelect('guild_record.guild', 'guild')
      .where('guild.guildName = :guildName', {
        guildName: battleDTO.teamA.guildName,
      })
      .getOne();

    const teamBGuildEntity: Guild = await this.guildRepository
      .createQueryBuilder('guild')
      .where('guild.guildName = :guildName', {
        guildName: battleDTO.teamB.guildName,
      })
      .getOne();
    const teamBGuildRecordEntity: GuildRecord = await this.guildRecordRepository
      .createQueryBuilder('guild_record')
      .leftJoinAndSelect('guild_record.guild', 'guild')
      .where('guild.guildName = :guildName', {
        guildName: battleDTO.teamB.guildName,
      })
      .getOne();

    const tierNames: string[] = [
      'BRONZE', // 1200
      'SILVER', // 1400
      'GOLD', // 1600
      'PLATINUM', // 1900
      'DIAMOND', // 2200
      'MASTER', // 2600
      'GRANDMASTER', // 3000
      'CHALLENGER', // 3500
    ];

    if (battleDTO.teamA.isWinning) {
      //TeamA 승리
      const teamATierIndex = tierNames.indexOf(
        teamAGuildRecordEntity.guild.guildTier,
      );
      const teamBTierIndex = tierNames.indexOf(
        teamBGuildRecordEntity.guild.guildTier,
      );

      const tierDifference = Math.abs(teamATierIndex - teamBTierIndex);
      const resultScore =
        20 +
        (teamATierIndex > teamBTierIndex ? -tierDifference : tierDifference);

      teamAGuildRecordEntity.recordVictory++;
      teamAGuildRecordEntity.recordLadder += resultScore;
      teamAGuildEntity.guildTier = this.calGuildTier(
        teamAGuildRecordEntity.recordLadder,
      );

      teamBGuildRecordEntity.recordDefeat++;
      teamBGuildRecordEntity.recordLadder -= resultScore;
      teamBGuildEntity.guildTier = this.calGuildTier(
        teamBGuildRecordEntity.recordLadder,
      );
    } else {
      //TeamB 승리
      const teamATierIndex = tierNames.indexOf(
        teamAGuildRecordEntity.guild.guildTier,
      );
      const teamBTierIndex = tierNames.indexOf(
        teamBGuildRecordEntity.guild.guildTier,
      );

      const tierDifference = Math.abs(teamATierIndex - teamBTierIndex);
      const resultScore =
        20 +
        (teamATierIndex > teamBTierIndex ? -tierDifference : tierDifference);

      teamAGuildRecordEntity.recordDefeat++;
      teamAGuildRecordEntity.recordLadder -= resultScore;
      teamAGuildEntity.guildTier = this.calGuildTier(
        teamAGuildRecordEntity.recordLadder,
      );

      teamBGuildRecordEntity.recordVictory++;
      teamBGuildRecordEntity.recordLadder += resultScore;
      teamBGuildEntity.guildTier = this.calGuildTier(
        teamBGuildRecordEntity.recordLadder,
      );
    }

    await this.guildRepository.save(teamAGuildEntity);
    await this.guildRecordRepository.save(teamAGuildRecordEntity);
    await this.guildRepository.save(teamBGuildEntity);
    await this.guildRecordRepository.save(teamBGuildRecordEntity);

    // return this.battleMapper.toDTO(
    //   await this.battleRepository.save(battleEntity),
    // );
  }

  //===========================================================================//
  //Battle Func
  //===========================================================================//
  private async createBattleTeam(teamDTO: BattleTeamDTO): Promise<BattleTeam> {
    const playerEntities: (BattlePlayer | null)[] = await Promise.all(
      [
        teamDTO.player1,
        teamDTO.player2,
        teamDTO.player3,
        teamDTO.player4,
        teamDTO.player5,
      ].map(async (playerDTO: BattlePlayerDTO) => {
        if (!playerDTO) {
          return null; // 플레이어 정보가 null인 경우 null 반환
        }
        const playerEntity: BattlePlayer =
          this.battlePlayerRepository.create(playerDTO);
        return await this.battlePlayerRepository.save(playerEntity);
      }),
    );

    // 팀 엔티티 생성 및 저장
    const teamEntity: BattleTeam = this.battleTeamRepository.create({
      isWinning: teamDTO.isWinning,
      guildName: teamDTO.guildName,
      player1: playerEntities[0] || null,
      player2: playerEntities[1] || null,
      player3: playerEntities[2] || null,
      player4: playerEntities[3] || null,
      player5: playerEntities[4] || null,
    });

    const savedTeam: BattleTeam = await this.battleTeamRepository.save(
      teamEntity,
    );

    return savedTeam;
  }

  private calGuildTier(ladderPoint: number): string {
    const tierScoreMap = {
      BRONZE: 1200,
      SILVER: 1400,
      GOLD: 1600,
      PLATINUM: 1900,
      DIAMOND: 2200,
      MASTER: 2600,
      GRANDMASTER: 3000,
      CHALLENGER: 3500,
    };

    if (ladderPoint >= tierScoreMap['CHALLENGER']) {
      return 'CHALLENGER';
    } else if (ladderPoint >= tierScoreMap['GRANDMASTER']) {
      return 'GRANDMASTER';
    } else if (ladderPoint >= tierScoreMap['MASTER']) {
      return 'MASTER';
    } else if (ladderPoint >= tierScoreMap['DIAMOND']) {
      return 'DIAMOND';
    } else if (ladderPoint >= tierScoreMap['PLATINUM']) {
      return 'PLATINUM';
    } else if (ladderPoint >= tierScoreMap['GOLD']) {
      return 'GOLD';
    } else if (ladderPoint >= tierScoreMap['SILVER']) {
      return 'SILVER';
    } else {
      return 'BRONZE';
    }
  }
}
