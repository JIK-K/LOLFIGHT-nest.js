import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class CommentDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  postId: number;

  @IsOptional()
  postBoardId: string;

  @IsOptional()
  commentContent: string;

  @IsOptional()
  depth: number;

  @IsOptional()
  orderNomber: number;
}
