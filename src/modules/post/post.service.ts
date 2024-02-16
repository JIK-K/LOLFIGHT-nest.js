import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostMapper } from './mapper/post.mapper';
import { PostDTO } from './DTOs/post.dto';
import { Builder } from 'builder-pattern';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private postMapper: PostMapper,
  ) {}

  /**
   * Post 생성
   * @param postDTO
   * @returns
   */
  async createPost(postDTO: PostDTO): Promise<PostDTO> {
    const postEntity: Post = Builder<Post>()
      .id(postDTO.id)
      .postTitle(postDTO.postTitle)
      .postContent(postDTO.postContent)
      .postWriter(postDTO.postWriter)
      .postDate(postDTO.postDate)
      .postViews(postDTO.postViews)
      .postLikes(postDTO.postLikes)
      .postComments(postDTO.postComments)
      .build();

    return this.postMapper.toDTO(await this.postRepository.save(postEntity));
  }
}
