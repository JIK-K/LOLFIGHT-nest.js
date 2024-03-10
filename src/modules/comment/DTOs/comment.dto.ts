import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';

export class CommentDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  commentContent: string;

  @IsOptional()
  depth: number;

  @IsOptional()
  orderNumber: number;

  @IsOptional()
  deletedTrue: boolean;

  @IsOptional()
  deletedAt: Date;

  @IsOptional()
  isCommentForComment: boolean;

  @IsOptional()
  postId: number;

  @IsOptional()
  postBoardId: string;

  @IsOptional()
  memberId: string;
}
