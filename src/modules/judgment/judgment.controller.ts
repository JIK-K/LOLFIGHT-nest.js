import {
  Bind,
  Body,
  Controller,
  Logger,
  Post,
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

@UseGuards(AuthGuard('access'))
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
  @Post()
  @UseInterceptors(FileInterceptor('judgmentVideo'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() judgmentDTO: JudgmentDTO,
  ): Promise<ResponseDTO<JudgmentDTO>> {
    this.logger.log(`Create judgment post: ${JSON.stringify(judgmentDTO)}`);
    console.log(file);

    return ResponseUtil.makeSuccessResponse(
      await this.judgmentService.createJudgment(judgmentDTO, file),
    );
  }
}
