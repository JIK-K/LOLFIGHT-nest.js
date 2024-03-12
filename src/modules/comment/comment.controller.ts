import { Body, Post, Logger } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDTO } from './DTOs/comment.dto';
import { ResponseUtil } from 'src/utils/response.util';
import { ResponseDTO } from 'src/common/DTOs/response.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  private logger: Logger = new Logger();

  /**
   * Comment 생성
   * @param commentDTO
   * @returns
   */
  @Post()
  async createComment(
    @Body() commentDTO: CommentDTO,
  ): Promise<ResponseDTO<CommentDTO>> {
    this.logger.log('Create Comment : ', commentDTO.post.postBoard);

    return ResponseUtil.makeSuccessResponse(
      await this.commentService.createComment(commentDTO),
    );
  }
}
