import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { In, Repository } from 'typeorm';
import { CommentMapper } from './mapper/comment.mapper';
import { CommentDTO } from './DTOs/comment.dto';
import { Builder } from 'builder-pattern';
import { Board } from '../board/entities/board.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private commentMapper: CommentMapper,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  private logger: Logger = new Logger();

  /**
   * Comment 생성
   * @param commentDTO
   * @returns
   */
  async createComment(commentDTO: CommentDTO): Promise<CommentDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: commentDTO.post.postBoard,
      })
      .getOne();

    this.logger.log('나여깄소 : ', getBoardData.id);

    const commentEntity: Comment = Builder<Comment>()
      .id(commentDTO.id)
      .commentContent(commentDTO.commentContent)
      .depth(commentDTO.depth)
      .orderNumber(commentDTO.orderNumber)
      .deletedTrue(commentDTO.deletedTrue)
      .deletedAt(commentDTO.deletedAt)
      .isCommentForComment(commentDTO.isCommentForComment)
      .postId(commentDTO.postId)
      .postBoardId(getBoardData.id)
      .memberId(commentDTO.memberId)
      .build();

    this.logger.log('Create Comment : ', commentDTO);
    this.logger.log('Create Comment : ', commentDTO.id);

    const createdComment = this.commentMapper.toDTO(
      await this.commentRepository.save(commentEntity),
    );

    return createdComment;
  }
}
