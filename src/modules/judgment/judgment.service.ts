import { Injectable } from '@nestjs/common';
import { Judgment } from './entities/judgment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JudgmentDTO } from './DTOs/judgment.dto';
import { Builder } from 'builder-pattern';
import { JudgmentMapper } from './mapper/judgment.mapper';
import { join } from 'path';
import { createWriteStream, existsSync, rmSync } from 'fs';

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
   * Judgment List
   * @returns
   */
  async getJudgmentList(): Promise<JudgmentDTO[]> {
    const judgmentEntities = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .getMany();

    return await this.judgmentMapper.toDTOList(judgmentEntities);
  }

  async getJudgment(id: number): Promise<JudgmentDTO> {
    const judgmentEntity = await this.judgmentRepository
      .createQueryBuilder('judgment')
      .where('id = :id', {
        id: id,
      })
      .getOne();

    return await this.judgmentMapper.toDTO(judgmentEntity);
  }
}
