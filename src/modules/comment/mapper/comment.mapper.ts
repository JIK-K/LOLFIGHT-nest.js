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
    const {
      id,
      commentContent,
      depth,
      orderNumber,
      deletedTrue,
      deletedAt,
      isCommentForComment,
      postId,
      postBoardId,
      member,
    } = commentEntity;

    const writer = member.memberName;

    return Builder<CommentDTO>()
      .id(id)
      .commentContent(commentContent)
      .depth(depth)
      .orderNumber(orderNumber)
      .deletedTrue(deletedTrue)
      .deletedAt(deletedAt)
      .isCommentForComment(isCommentForComment)
      .postId(postId)
      .postBoardId(postBoardId)
      .writer(writer)
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
