import { Body, Controller, Inject, Logger, Post, Query } from '@nestjs/common';
import { BattleService } from './battle.service';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { BattleDTO } from './DTOs/battle.dto';
import { ResponseUtil } from 'src/utils/response.util';
import SocketGateway from 'src/socket/socket.gateway';

@Controller('battle')
export class BattleController {
  constructor(
    private battleService: BattleService,
    @Inject(SocketGateway) private socketGateWay: SocketGateway,
  ) {}

  private logger: Logger = new Logger();

  /**
   * Battle 내전 결과 생성
   * @param battleDTO
   * @returns
   */
  @Post()
  async create(
    @Body() battleDTO: BattleDTO,
    @Query('fightRoomName') fightRoomName: string,
  ): Promise<ResponseDTO<string>> {
    this.logger.log(
      `Create Battle Results : ${battleDTO.teamA.guildName} vs ${battleDTO.teamB.guildName}`,
    );
    this.socketGateWay.updateFightRoomStatus(fightRoomName);
    return ResponseUtil.makeSuccessResponse(
      await this.battleService.createBattle(battleDTO),
    );
  }
}
