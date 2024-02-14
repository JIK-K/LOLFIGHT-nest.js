import {
  Bind,
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildDTO } from './DTOs/guild.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/configs/multer.config';

@Controller('guild')
export class GuildController {
  constructor(private guildService: GuildService) {}

  private logger: Logger = new Logger();

  @Post()
  @UseInterceptors(FileInterceptor('guildImage', multerConfig))
  @Bind(UploadedFile())
  async create(
    file: Express.Multer.File,
    @Body() guildDTO: GuildDTO,
  ): Promise<ResponseDTO<GuildDTO>> {
    // this.logger.log(`Create Guild : ${guildDTO}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.createGuild(guildDTO, file),
    );
  }
}
