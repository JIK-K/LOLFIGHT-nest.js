import {
  Bind,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildDTO } from './DTOs/guild.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/configs/multer.config';
import { MemberDTO } from '../member/DTOs/member.dto';

@Controller('guild')
export class GuildController {
  constructor(private guildService: GuildService) {}

  private logger: Logger = new Logger();

  /**
   * Guild 생성
   * @param file
   * @param guildDTO
   * @returns
   */
  @Post()
  @UseInterceptors(FileInterceptor('guildImage', multerConfig))
  @Bind(UploadedFile())
  async create(
    file: Express.Multer.File,
    @Body() guildDTO: GuildDTO,
  ): Promise<ResponseDTO<GuildDTO>> {
    this.logger.log(
      `Create Guild : [${guildDTO.guildName}] Guild Master : [${guildDTO.guildMaster}]`,
    );
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.createGuild(guildDTO, file),
    );
  }

  /**
   * guild 길드원 리스트
   * @param guildName
   * @returns
   */
  @Get('guildMember')
  async findMemberList(
    @Query('name') guildName: string,
  ): Promise<ResponseDTO<MemberDTO[]>> {
    this.logger.log(`Get Guild Member List : ${guildName}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.getGuildMemberList(guildName),
    );
  }

  /**
   * guild 해체
   * @param guildName
   * @returns
   */
  @Delete()
  async delete(
    @Query('name') guildName: string,
  ): Promise<ResponseDTO<GuildDTO>> {
    this.logger.log(`Delete Guild : ${guildName}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.deleteGuild(guildName),
    );
  }
}
