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
  post: string;
}
