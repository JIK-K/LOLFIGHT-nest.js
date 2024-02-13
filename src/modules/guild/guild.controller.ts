import { Body, Controller, Logger, Post } from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildDTO } from './DTOs/guild.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('guild')
export class GuildController {
  constructor(private guildService: GuildService) {}

  private logger: Logger = new Logger();

  @Post()
  async create(@Body() guildDTO: GuildDTO): Promise<ResponseDTO<GuildDTO>> {
    this.logger.log(`Create Guild : ${guildDTO}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.createGuild(guildDTO),
    );
  }
}
