import { IsOptional } from 'class-validator';
import { BaseDTO } from 'src/base/base.dto';
import { PostDTO } from 'src/modules/post/DTOs/post.dto';
import { MemberDTO } from 'src/modules/member/DTOs/member.dto';

export class PostLikeDTO extends BaseDTO {
  @IsOptional()
  id: string;

  @IsOptional()
  post: PostDTO;

  @IsOptional()
  member: MemberDTO;
}
