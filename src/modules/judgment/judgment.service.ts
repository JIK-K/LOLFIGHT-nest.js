import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Judgment } from './entities/judgment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JudgmentDTO } from './DTOs/judgment.dto';
import { Builder } from 'builder-pattern';
import { JudgmentMapper } from './mapper/judgment.mapper';
import { join } from 'path';
import { createWriteStream, existsSync, rmSync } from 'fs';
import { CODE_CONSTANT } from 'src/common/constants/common-code.constant';

@Injectable()
export class JudgmentService {
  constructor(
    @InjectRepository(Judgment)
    private judgmentRepository: Repository<Judgment>,
    private judgmentMapper: JudgmentMapper,
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
      const filePath = join(__dirname, '../../..', 'public/judgment', fileName);

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

  async voteFaction(faction: string, judgmentId: number): Promise<boolean> {
    const judgmentEntity = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .where(`id = :id`, {
        id: judgmentId,
      })
      .getOne();

    if (!judgmentEntity) {
      throw new HttpException(CODE_CONSTANT.NO_DATA, HttpStatus.BAD_REQUEST);
    }

    if (faction === 'left') {
      judgmentEntity.judgmentLeftLike += 1;
    } else {
      judgmentEntity.judgmentRightLike += 1;
    }

    await this.judgmentRepository.save(judgmentEntity);

    return true;
  }
}
