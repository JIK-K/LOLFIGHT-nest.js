import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { CommentDTO } from '../DTOs/comment.dto';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentMapper {
  constructor() {
    // empty
  }

  toDTO(commentEntity: Comment): CommentDTO {
    const { id, postId, postBoardId, commentContent, depth, orderNomber } =
      commentEntity;

    return Builder<CommentDTO>()
      .id(id)
      .postId(postId)
      .postBoardId(postBoardId)

      .commentContent(commentContent)
      .depth(depth)
      .orderNomber(orderNomber)
      .build();
  }

  toDTOList(commentEntites: Comment[]): CommentDTO[] {
    const commentDTOList = [];
    commentEntites.forEach((commentEntity) =>
      commentDTOList.push(this.toDTO(commentEntity)),
    );

    return commentDTOList;
  }
}
