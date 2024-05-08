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

@Injectable()
export class BattleService {
  constructor(
    @InjectRepository(Battle) private battleRepository: Repository<Battle>,
    @InjectRepository(BattleTeam)
    private battleTeamRepository: Repository<BattleTeam>,
    @InjectRepository(BattlePlayer)
    private battlePlayerRepository: Repository<BattlePlayer>,
  ) {}

  /**
   * Battle 결과 생성
   * @param battleDTO
   * @returns
   */
  async createBattle(battleDTO: BattleDTO): Promise<BattleDTO> {
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

    // 전투 엔티티 저장
    const savedBattle: Battle = await this.battleRepository.save(battleEntity);

    // 저장된 전투 DTO 반환
    return savedBattle;
  }

  //===========================================================================//
  //Battle Func
  //===========================================================================//
  private async createBattleTeam(teamDTO: BattleTeamDTO): Promise<BattleTeam> {
    const playerEntities: BattlePlayer[] = await Promise.all(
      [
        teamDTO.player1,
        teamDTO.player2,
        teamDTO.player3,
        teamDTO.player4,
        teamDTO.player5,
      ].map(async (playerDTO: BattlePlayerDTO) => {
        const playerEntity: BattlePlayer =
          this.battlePlayerRepository.create(playerDTO);
        return await this.battlePlayerRepository.save(playerEntity);
      }),
    );

    // 팀 엔티티 생성 및 저장
    const teamEntity: BattleTeam = this.battleTeamRepository.create({
      isWinning: teamDTO.isWinning,
      guildName: teamDTO.guildName,
      player1: playerEntities[0],
      player2: playerEntities[1],
      player3: playerEntities[2],
      player4: playerEntities[3],
      player5: playerEntities[4],
    });

    const savedTeam: BattleTeam = await this.battleTeamRepository.save(
      teamEntity,
    );

    return savedTeam;
  }
}
