import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Judgment } from './entities/judgment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JudgmentDTO } from './DTOs/judgment.dto';
import { Builder } from 'builder-pattern';
import { JudgmentMapper } from './mapper/judgment.mapper';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync, rmSync } from 'fs';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';
import { JudgmentVote } from './entities/judgment_vote.entity';
import { JudgmentVoteMapper } from './mapper/judgment_vote.mapper';
import { Member } from '../member/entities/member.entity';

@Injectable()
export class JudgmentService {
  constructor(
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    private judgmentMapper: JudgmentMapper,
    @InjectRepository(JudgmentVote)
    private judgmentVoteRepository: Repository<JudgmentVote>,
    private judgmentVoteMapper: JudgmentVoteMapper,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * Judgment 생성
   * @param judgmentDTO
   * @returns
   */
  async createJudgment(
    judgmentDTO: JudgmentDTO,
    file?: Express.Multer.File,
  ): Promise<JudgmentDTO> {
    let judgmentVideoPath: string | undefined;

    if (file) {
      const fileName = `${judgmentDTO.judgmentTitle}_${judgmentDTO.judgmentWriter}.mp4`;
      const dirPath = join(__dirname, '../../..', 'public/judgment');
      const filePath = join(dirPath, fileName);

      if (existsSync(filePath)) {
        rmSync(filePath);
      }

      const writeStream = createWriteStream(filePath);
      writeStream.write(file.buffer);
      writeStream.end();

      judgmentVideoPath = `public/judgment/${fileName}`;
    }

    const judgmentEntity: Judgment = Builder<Judgment>()
      // .id(judgmentDTO.id)
      .judgmentWriter(judgmentDTO.judgmentWriter)
      .judgmentTitle(judgmentDTO.judgmentTitle)
      .judgmentDesc(judgmentDTO.judgmentDesc)
      .judgmentLeftChampion(judgmentDTO.judgmentLeftChampion)
      .judgmentLeftTier(judgmentDTO.judgmentLeftTier)
      .judgmentLeftName(judgmentDTO.judgmentLeftName)
      .judgmentLeftLine(judgmentDTO.judgmentLeftLine)
      .judgmentLeftLike(judgmentDTO.judgmentLeftLike)
      .judgmentRightChampion(judgmentDTO.judgmentRightChampion)
      .judgmentRightTier(judgmentDTO.judgmentRightTier)
      .judgmentRightName(judgmentDTO.judgmentRightName)
      .judgmentRightLine(judgmentDTO.judgmentRightLine)
      .judgmentRightLike(judgmentDTO.judgmentRightLike)
      .judgmentVideo(judgmentVideoPath)
      .build();

    return this.judgmentMapper.toDTO(
      await this.judgmentRepository.save(judgmentEntity),
    );
  }

  /**
   * Judgment 게시글 리스트 조회
   * @returns
   */
  async getJudgmentList(): Promise<JudgmentDTO[]> {
    const judgmentEntities = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .getMany();

    return await this.judgmentMapper.toDTOList(judgmentEntities);
  }

  /**
   * Judgment 게시글 조회
   * @param id
   * @returns
   */
  async getJudgment(id: number): Promise<JudgmentDTO> {
    const judgmentEntity = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .where('id = :id', {
        id: id,
      })
      .getOne();

    return await this.judgmentMapper.toDTO(judgmentEntity);
  }

  /**
   * judgment 조회수 증가
   * @param judgment
   * @returns
   */
  async increaseJudgmentView(judgment: JudgmentDTO): Promise<boolean> {
    const judgmentEntity = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .where('id = :id', {
        id: judgment.id,
      })
      .getOne();
    if (!judgmentEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    judgmentEntity.judgmentView += 1;

    await this.judgmentRepository.save(judgmentEntity);

    return true;
  }

  /**
   * Judgment 투표
   * @param faction
   * @param judgmentId
   * @returns
   */
  async voteFaction(
    faction: string,
    judgmentId: number,
    memberId: string,
  ): Promise<boolean> {
    const judgmentEntity = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .where(`id = :id`, {
        id: judgmentId,
      })
      .getOne();

    if (!judgmentEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    const judgmentVoteEntity = await this.judgmentVoteRepository
      .createQueryBuilder('judgment_vote')
      .where('judgmentId = :judgmentId', { judgmentId: judgmentId })
      .andWhere('memberId = :memberId', { memberId: memberId })
      .getOne();

    if (judgmentVoteEntity) {
      if (faction === 'left') {
        judgmentEntity.judgmentLeftLike -= 1;
      } else {
        judgmentEntity.judgmentRightLike -= 1;
      }

      await this.judgmentVoteRepository.remove(judgmentVoteEntity);
      await this.judgmentRepository.save(judgmentEntity);
    } else {
      if (faction === 'left') {
        judgmentEntity.judgmentLeftLike += 1;
      } else {
        judgmentEntity.judgmentRightLike += 1;
      }

      const memberEntity = await this.memberRepository.findOne({
        where: { id: memberId },
      });
      if (!memberEntity) {
        throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
      }

      const judgmentVoteEntity: JudgmentVote = Builder<JudgmentVote>()
        .judgment(judgmentEntity)
        .member(memberEntity)
        .voteSide(faction)
        .build();

      await this.judgmentVoteRepository.save(judgmentVoteEntity);
      await this.judgmentRepository.save(judgmentEntity);

      return true;
    }
  }

  /**
   * Judgment 투표 여부 조회
   * @param judgmentId
   * @param memberId
   * @returns
   */
  async getVoteFaction(judgmentId: number, memberId: string): Promise<string> {
    const judgmentVoteEntity = await this.judgmentVoteRepository
      .createQueryBuilder('judgment_vote')
      .where('judgmentId = :judgmentId', { judgmentId: judgmentId })
      .andWhere('memberId = :memberId', { memberId: memberId })
      .getOne();

    if (!judgmentVoteEntity) {
      return 'none';
    }

    return judgmentVoteEntity.voteSide === 'left' ? 'left' : 'right';
  }
}
