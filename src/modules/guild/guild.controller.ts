import {
  Bind,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
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
import { GuildInviteDTO } from './DTOs/guild_invite.dto';

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
   * Guild 정보 조회
   * @param guildName
   * @returns
   */
  @Get('/info')
  async guildInfo(
    @Query('name') guildName: string,
  ): Promise<ResponseDTO<GuildDTO>> {
    this.logger.log(`Get Guild Info : ${guildName}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.getGuildInfo(guildName),
    );
  }

  /**
   * Guild 길드 리스트
   * @returns
   */
  @Get('/list')
  async guildList(): Promise<ResponseDTO<GuildDTO[]>> {
    this.logger.log(`Get Guild List`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.getGuildList(),
    );
  }

  /**
   * guild 길드원 리스트
   * @param guildName
   * @returns
   */
  @Get('/guildMember')
  async findMemberList(
    @Query('name') guildName: string,
  ): Promise<ResponseDTO<MemberDTO[]>> {
    this.logger.log(`Get Guild Member List : ${guildName}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.getGuildMemberList(guildName),
    );
  }

  /**
   * Guild 해체
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

  /**
   * Guild-Invite 길드 가입신청
   * @param guildInviteDTO
   * @returns
   */
  @Post('/invite')
  async guildInvite(
    @Body() guildInviteDTO: GuildInviteDTO,
  ): Promise<ResponseDTO<GuildInviteDTO>> {
    this.logger.log(`Invite Guild`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.addGuildInvite(guildInviteDTO),
    );
  }

  /**
   * Guild-Invite 길드 가입신청 리스트
   * @param guildName
   * @returns
   */
  @Get('/invite/list')
  async guildInviteList(
    @Query('name') guildName: string,
  ): Promise<ResponseDTO<GuildInviteDTO[]>> {
    this.logger.log(`Get Guild[${guildName}] Invite List`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.getGuildInviteList(guildName),
    );
  }

  /**
   * Guild-Invite 길드 가입신청 수락
   * @param memberId
   * @param guildId
   * @returns
   */
  @Get('/invite/accept')
  async inviteAccept(
    @Query('memberId') memberId: string,
    @Query('guildId') guildId: string,
  ): Promise<ResponseDTO<MemberDTO>> {
    this.logger.log(`Invite Accept ${memberId} - ${guildId}`);
    return ResponseUtil.makeSuccessResponse(
      await this.guildService.inviteAccept(memberId, guildId),
    );
  }
}
