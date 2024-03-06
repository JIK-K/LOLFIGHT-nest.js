import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { PostMapper } from './mapper/post.mapper';
import { PostDTO } from './DTOs/post.dto';
import { Builder } from 'builder-pattern';
import { Board } from '../board/entities/board.entity';
import { join } from 'path';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  rmSync,
  unlinkSync,
  mkdirSync,
} from 'fs';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private postMapper: PostMapper,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  private logger: Logger = new Logger();

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
      .postViews(postDTO.postViews)
      .postLikes(postDTO.postLikes)
      .postComments(postDTO.postComments)
      .boardId(getBoardData.id)
      .build();

    console.log('ddd', postEntity);

    const createdPost = this.postMapper.toDTO(
      await this.postRepository.save(postEntity),
    );

    return createdPost;
  }

  async saveImage(image: Express.Multer.File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let postImagePath: string | undefined;
      if (image) {
        const uploadDir = join(
          __dirname,
          '../../..',
          'public/image/post',
          // image.filename,
        );
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = join(uploadDir, image.filename);
        const readStream = createReadStream(image.path);
        const writeStream = createWriteStream(filePath);
        readStream.pipe(writeStream);
        writeStream.on('finish', () => {
          unlinkSync(image.path);
          postImagePath = `public/image/post/${image.filename}`;
          console.log('postImagePath', postImagePath);
          resolve(postImagePath); // 이미지 저장이 완료된 후에 경로를 반환합니다.
        });
        writeStream.on('error', (error) => {
          reject(error);
        });
      }
    });
  }

  /**
   * Post 리스트 조회
   * @param board
   * @returns {Promise<PostDTO[]>}
   */
  async getPostList(board: string): Promise<PostDTO[]> {
    let postEntites: Post[];
    if (board == '전체') {
      postEntites = await this.postRepository.find();
      this.logger.log('postEntites', postEntites);
    } else {
      this.logger.log('board', board);
      const getBoardData = await this.boardRepository
        .createQueryBuilder('board')
        .where('board_type = :type', {
          type: board,
        })
        .getOne();

      this.logger.log('getBoardData', getBoardData);

      postEntites = await this.postRepository
        .createQueryBuilder('post')
        .where('board_id = :id', { id: getBoardData.id })
        .getMany();

      this.logger.log('postEntites', postEntites);
    }

    return await this.postMapper.toDTOList(postEntites);
  }

  /**
   * Post 내용 조회
   * @param board, postId
   * @returns {Promise<PostDTO>}
   */
  async getPost(board: string, postId: number): Promise<PostDTO> {
    this.logger.log('board, postId', board, postId);
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: board,
      })
      .getOne();

    this.logger.log('getBoardData', getBoardData);

    const postEntity = await this.postRepository
      .createQueryBuilder('post')
      .where('board_id = :id', { id: getBoardData.id })
      .andWhere('id = :postId', { postId: postId })
      .getOne();

    this.logger.log('postEntity', postEntity);
    return await this.postMapper.toDTO(postEntity);
  }
}
