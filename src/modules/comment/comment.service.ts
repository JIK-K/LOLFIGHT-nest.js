import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { In, Repository } from 'typeorm';
import { CommentMapper } from './mapper/comment.mapper';
import { CommentDTO } from './DTOs/comment.dto';
import { Builder } from 'builder-pattern';
import { Board } from '../board/entities/board.entity';
import { Post } from '../post/entities/post.entity';
import { Member } from '../member/entities/member.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    private commentMapper: CommentMapper,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
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

    // const getMemberData = await this.memberRepository.findOne({
    //   where: { memberId: commentDTO.memberId },
    // });

    const getPostData = await this.postRepository.findOne({
      where: { id: commentDTO.post.id },
    });

    getPostData.postComments += 1;
    await this.postRepository.save(getPostData);

    const commentEntity: Comment = Builder<Comment>()
      .id(commentDTO.id)
      .commentContent(commentDTO.commentContent)
      .orderNumber(commentDTO.orderNumber)
      .deletedTrue(commentDTO.deletedTrue)
      .deletedAt(commentDTO.deletedAt)
      .isCommentForComment(commentDTO.isCommentForComment)
      .postId(commentDTO.postId)
      .postBoardId(getBoardData.id)
      .memberId(commentDTO.memberId)
      .build();

    if (commentDTO.parentComment == null) {
      commentEntity.isCommentForComment = false; // 댓글
      commentEntity.depth = 0;
      commentEntity.orderNumber = getPostData.postComments + 1; // 순서
    } else {
      // 부모 댓글 존재
      this.logger.log('부모 댓글 존재@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
      const getParentCommentData = await this.commentRepository.findOne({
        where: { id: commentDTO.parentComment },
      });
      commentEntity.isCommentForComment = true; // 대댓글
      commentEntity.depth = getParentCommentData.depth + 1;
      commentEntity.orderNumber = getParentCommentData.orderNumber; // 순서
      commentEntity.parentComment = getParentCommentData;
    }

    this.logger.log('Create Comment : ', commentDTO);

    const createdComment = this.commentMapper.toDTO(
      await this.commentRepository.save(commentEntity),
    );

    return createdComment;
  }

  /**
   * Comment 조회
   * @param
   * @returns CommentDTO[]
   */
  async getCommentList(
    postId: number,
    postBoard: string,
  ): Promise<CommentDTO[]> {
    this.logger.log(`id : ${postId}`);
    this.logger.log(`boardId : ${postBoard}`);

    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postBoard,
      })
      .getOne();

    // const commentEntities = await this.commentRepository.find({
    //   where: { postId: postId, postBoardId: getBoardData.id },
    //   order: { orderNumber: 'ASC' },
    // });

    // const commentEntities = await this.commentRepository
    //   .createQueryBuilder('comment')
    //   .leftJoinAndSelect('comment.member', 'member')
    //   .where('comment.postId = :postId', { postId: postId })
    //   .andWhere('comment.postBoardId = :postBoardId', {
    //     postBoardId: getBoardData.id,
    //   })
    //   .orderBy('comment.orderNumber', 'ASC')
    //   .getMany();

    const commentEntities = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.member', 'member')
      .where('comment.postId = :postId', { postId: postId })
      .andWhere('comment.postBoardId = :postBoardId', {
        postBoardId: getBoardData.id,
      })
      .orderBy('comment.orderNumber', 'ASC')
      .addOrderBy('comment.createdAt', 'ASC')
      .getMany();

    this.logger.log('commentEntities : ', commentEntities);

    return this.commentMapper.toDTOList(commentEntities);
  }
}
