import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Member } from 'src/modules/member/entities/member.entity';
import { PostDTO } from 'src/modules/post/DTOs/post.dto';

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
  parentComment: string;

  @IsOptional()
  isCommentForComment: boolean;

  @IsOptional()
  postId: number;

  @IsOptional()
  postBoardId: string;

  @IsOptional()
  post: PostDTO;

  @IsOptional()
  writer: Member;

  @IsOptional()
  memberId: string;

  @IsOptional()
  commentDate: Date;
}
