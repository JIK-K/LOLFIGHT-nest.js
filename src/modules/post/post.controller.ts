import { Body, Controller, Post, Logger } from '@nestjs/common';
import { PostService } from './post.service';
import { PostDTO } from './DTOs/post.dto';
import { ResponseDTO } from 'src/common/DTOs/response.dto';
import { ResponseUtil } from 'src/utils/response.util';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {
    // empty
  }

  private logger: Logger = new Logger();

  /**
   * Post 생성
   * @param postDTO
   * @returns
   */
  @Post()
  async create(@Body() postDTO: PostDTO): Promise<ResponseDTO<PostDTO>> {
    this.logger.log('postDTO', postDTO);
    this.logger.log(`Create Post : ${postDTO}`);

    return ResponseUtil.makeSuccessResponse(
      await this.postService.createPost(postDTO),
    );
  }
}
