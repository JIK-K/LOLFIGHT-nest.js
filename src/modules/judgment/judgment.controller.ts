import {
  Bind,
  Body,
  Controller,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JudgmentService } from './judgment.service';
import { JudgmentDTO } from './DTOs/judgment.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { videoConfig } from 'src/common/configs/multer.config';
import { Judgment } from './entities/judgment.entity';

@Controller('judgment')
export class JudgmentController {
  constructor(private judgmentService: JudgmentService) {}

  private logger: Logger = new Logger();

  /**
   * Judgment 생성
   * @param file
   * @param judgmentDTO
   * @returns
   */
  @UseGuards(AuthGuard('access'))
  @Post()
  @UseInterceptors(FileInterceptor('judgmentVideo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() judgmentDTO: JudgmentDTO,
  ): Promise<ResponseDTO<JudgmentDTO>> {
    this.logger.log(`Create judgment post: ${JSON.stringify(judgmentDTO)}`);

    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.createJudgment(judgmentDTO, file),
    );
  }

  /**
   * Judgment 게시글 리스트 조회
   * @returns
   */
  @Get('/list')
  async getJudgmentList(): Promise<ResponseDTO<JudgmentDTO[]>> {
    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.getJudgmentList(),
    );
  }

  /**
   * Judgment 게시글 조회
   * @param id
   * @returns
   */
  @Get('/post')
  async getJudgment(
    @Query('id') id: number,
  ): Promise<ResponseDTO<JudgmentDTO>> {
    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.getJudgment(id),
    );
  }

  /**
   * Judgment 조회수 증가
   * @param Judgment
   * @returns
   */
  @Patch('/view')
  async increaseJudgment(
    @Body() Judgment: JudgmentDTO,
  ): Promise<ResponseDTO<boolean>> {
    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.increaseJudgmentView(Judgment),
    );
  }

  @Patch(`/vote`)
  async voteFaction(
    @Body() data: { faction: string; judgmentId: number },
  ): Promise<ResponseDTO<boolean>> {
    const { faction, judgmentId } = data;
    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.voteFaction(faction, judgmentId),
    );
  }
}
