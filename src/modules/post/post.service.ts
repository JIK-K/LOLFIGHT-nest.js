import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostMapper } from './mapper/post.mapper';
import { PostDTO } from './DTOs/post.dto';
import { Builder } from 'builder-pattern';
import { Board } from '../board/entities/board.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private postMapper: PostMapper,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  /**
   * Post 생성
   * @param postDTO
   * @returns
   */
  async createPost(postDTO: PostDTO): Promise<PostDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postDTO.postBoard,
      })
      .getOne();

    const postEntity: Post = Builder<Post>()
      .id(postDTO.id)
      .postTitle(postDTO.postTitle)
      .postContent(postDTO.postContent)
      .postWriter(postDTO.postWriter)
      .postDate(postDTO.postDate)
      .postViews(postDTO.postViews)
      .postLikes(postDTO.postLikes)
      .postComments(postDTO.postComments)
      .boardId(getBoardData.id)
      .build();

    console.log('ddd', postEntity);

    return this.postMapper.toDTO(await this.postRepository.save(postEntity));
  }
}
