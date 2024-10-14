import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Member } from '../member/entities/member.entity';
import { In, Repository } from 'typeorm';
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
import { PostLikeDTO } from './DTOs/post_like.dto';
import { PostLike } from './entities/post_like.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private postMapper: PostMapper,
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
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

    const getMemberData = await this.memberRepository.findOne({
      where: { memberName: postDTO.postWriter },
    });

    const postEntity: Post = Builder<Post>()
      .id(postDTO.id)
      .postTitle(postDTO.postTitle)
      .postContent(postDTO.postContent)
      .member(getMemberData)
      .postViews(postDTO.postViews)
      .postLikes(postDTO.postLikes)
      .postComments(postDTO.postComments)
      .board(getBoardData)
      .build();

    const createdPost = this.postMapper.toDTO(
      await this.postRepository.save(postEntity),
    );

    return createdPost;
  }

  /**
   * Post 이미지 저장
   * @param
   * @returns
   */
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
      postEntites = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.member', 'member')
        .leftJoinAndSelect('post.board', 'board')
        .where('deletedTrue = :deletedTrue', { deletedTrue: false })
        .andWhere('post.boardId NOT IN (:...excludedBoardIds)', {
          excludedBoardIds: [3, 4],
        })
        .getMany();
    } else {
      const getBoardData = await this.boardRepository
        .createQueryBuilder('board')
        .where('board_type = :type', {
          type: board,
        })
        .getOne();

      postEntites = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.member', 'member')
        .leftJoinAndSelect('post.board', 'board')
        .where('board_id = :id', { id: getBoardData.id })
        .andWhere('deletedTrue = :deletedTrue', { deletedTrue: false })
        .getMany();
    }

    return await this.postMapper.toDTOList(postEntites);
  }

  /**
   * Post 최근 게시물 조회
   * @param board
   * @returns
   */
  async getRecentPostList(board: number): Promise<PostDTO[]> {
    const postEntites = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.member', 'member')
      .leftJoinAndSelect('post.board', 'board')
      .where('board_id = :id', { id: board })
      .andWhere('deletedTrue = :deletedTrue', { deletedTrue: false })
      .orderBy('post.createdAt', 'DESC')
      .take(4)
      .getMany();

    return await this.postMapper.toDTOList(postEntites);
  }

  /**
   * Post 내용 조회
   * @param board, postId
   * @returns {Promise<PostDTO>}
   */
  async getPost(board: string, postId: number): Promise<PostDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: board,
      })
      .getOne();

    const postEntity = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.member', 'member')
      .leftJoinAndSelect('post.board', 'board')
      .where('post.board_id = :id', { id: getBoardData.id })
      .andWhere('post.id = :postId', { postId: postId })
      .getOne();

    postEntity.postViews += 1;

    const postDTO = await this.postMapper.toDTO(postEntity);
    postDTO.postBoard = board;

    return await postDTO;
  }

  /**
   * Post 추천수 증가
   * @param postId
   * @returns
   */
  async likePost(postDTO: PostDTO, memberId: string): Promise<PostDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postDTO.postBoard,
      })
      .getOne();

    const getMemberData = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    const postEntity = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.board', 'board')
      .leftJoinAndSelect('post.member', 'member') // 이거 왜 붙어있지???
      .where('post.id = :postId', { postId: postDTO.id })
      .andWhere('board.id = :boardId', { boardId: getBoardData.id })
      .getOne();

    const postLikeEntity = await this.postLikeRepository
      .createQueryBuilder('post_like')
      .leftJoinAndSelect('post_like.member', 'member')
      .leftJoinAndSelect('post_like.post', 'post')
      .where('post_like.post_id = :postId', { postId: postEntity.id })
      .andWhere('post_like.post_board_id = :post_board_id', {
        post_board_id: getBoardData.id,
      })
      .andWhere('post_like.member_id = :memberId', { memberId: memberId })
      .getOne();

    if (postLikeEntity !== null) {
      await this.postLikeRepository.remove(postLikeEntity);

      postEntity.postLikes -= 1;
    } else {
      const postLikeEntity = Builder<PostLike>()
        .post(postEntity)
        .member(getMemberData)
        .build();
      postEntity.postLikes += 1;
      await this.postLikeRepository.save(postLikeEntity);
    }

    this.logger.log('postEntity', postEntity);

    // await this.postLikeRepository.save(postLikeEntity);

    return this.postMapper.toDTO(await this.postRepository.save(postEntity));
  }

  /**
   * Post 추천 여부 조회
   * @param postDTO
   * @param memberId
   * @returns
   */
  async getPostLike(postDTO: PostDTO, memberId: string): Promise<boolean> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postDTO.postBoard,
      })
      .getOne();

    // const getMemberData = await this.memberRepository.findOne({
    //   where: { id: memberId },
    // });

    // const getPostData = await this.postRepository
    //   .createQueryBuilder('post')
    //   .leftJoinAndSelect('post.board', 'board')
    //   .leftJoinAndSelect('post.member', 'member')
    //   .where('post.id = :postId', { postId: postDTO.id })
    //   .andWhere('board.id = :boardId', { boardId: getBoardData.id })
    //   .getOne();

    const postLikeEntity = await this.postLikeRepository
      .createQueryBuilder('post_like')
      .leftJoinAndSelect('post_like.member', 'member')
      .where('post_like.post_id = :postId', { postId: postDTO.id })
      .andWhere('post_like.post_board_id = :post_board_id', {
        post_board_id: getBoardData.id,
      })
      .andWhere('post_like.member_id = :memberId', { memberId: memberId })
      .getOne();

    return postLikeEntity ? true : false;
  }

  /**
   * Post 조회수 증가
   * @param
   * @returns
   */
  async viewPost(postDTO: PostDTO): Promise<PostDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postDTO.postBoard,
      })
      .getOne();

    const postEntity = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.board', 'board')
      .leftJoinAndSelect('post.member', 'member')
      .where('post.id = :postId', { postId: postDTO.id })
      .andWhere('board.id = :boardId', { boardId: getBoardData.id })
      .getOne();

    postEntity.postViews += 1;

    // await this.redis.set(
    //   `${postDTO.id}_${memberId}`,
    //   JSON.stringify(postDTO),
    //   'EX',
    //   60,
    // );

    // console.log('redis', await this.redis.get(`${postDTO.id}_${memberId}`));

    return this.postMapper.toDTO(await this.postRepository.save(postEntity));
  }

  /**
   * Post 삭제
   * @param postDTO
   * @returns
   */
  async deletePost(postDTO: PostDTO): Promise<PostDTO> {
    const getBoardData = await this.boardRepository
      .createQueryBuilder('board')
      .where('board_type = :type', {
        type: postDTO.postBoard,
      })
      .getOne();

    const postEntity = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.board', 'board')
      .leftJoinAndSelect('post.member', 'member')
      .where('post.id = :postId', { postId: postDTO.id })
      .andWhere('board.id = :boardId', { boardId: getBoardData.id })
      .getOne();

    postEntity.deletedTrue = true;
    postEntity.deletedAt = new Date();

    return this.postMapper.toDTO(await this.postRepository.save(postEntity));
  }
}
