import { Body, Controller, Logger, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { BattleDTO } from './DTOs/battle.dto';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('battle')
export class BattleController {
  constructor(private battleService: BattleService) {}

  private logger: Logger = new Logger();

  @Post()
  async create(@Body() battleDTO: BattleDTO): Promise<ResponseDTO<BattleDTO>> {
    this.logger.log(`Create Battle Results : ${battleDTO.battleId}`);
    return ResponseUtil.makeSuccessResponse(
      await this.battleService.createBattle(battleDTO),
    );
  }
}
