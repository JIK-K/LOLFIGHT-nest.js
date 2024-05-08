import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { Board } from 'src/modules/board/entities/board.entity';

export class PostDTO extends BaseDTO {
  @IsOptional()
  id: number;

  @IsOptional()
  postTitle: string;

  @IsOptional()
  postContent: string;

  @IsOptional()
  postWriter: string;

  @IsOptional()
  postDate: Date;

  @IsOptional()
  postViews: number;

  @IsOptional()
  postLikes: number;

  @IsOptional()
  postComments: number;

  @IsOptional()
  postBoard: string;

  @IsOptional()
  deletedTrue: boolean;

  @IsOptional()
  deletedAt: Date;
}
