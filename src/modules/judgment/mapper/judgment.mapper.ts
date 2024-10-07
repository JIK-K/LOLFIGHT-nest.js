import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Judgment } from '../entities/judgment.entity';
import { JudgmentDTO } from '../DTOs/judgment.dto';

@Injectable()
export class JudgmentMapper {
  constructor() {}

  toDTO(judgmentEntity: Judgment): JudgmentDTO {
    const {
      id,
      judgmentWriter,
      judgmentTitle,
      judgmentDesc,
      judgmentLeftChampion,
      judgmentLeftTier,
      judgmentLeftName,
      judgmentLeftLine,
      judgmentLeftLike,
      judgmentRightChampion,
      judgmentRightTier,
      judgmentRightName,
      judgmentRightLine,
      judgmentRightLike,
      judgmentVideo,
      createdAt,
      updatedAt,
    } = judgmentEntity;

    return Builder<JudgmentDTO>()
      .id(id)
      .judgmentWriter(judgmentWriter)
      .judgmentTitle(judgmentTitle)
      .judgmentDesc(judgmentDesc)
      .judgmentLeftChampion(judgmentLeftChampion)
      .judgmentLeftTier(judgmentLeftTier)
      .judgmentLeftName(judgmentLeftName)
      .judgmentLeftLine(judgmentLeftLine)
      .judgmentLeftLike(judgmentLeftLike)
      .judgmentRightChampion(judgmentRightChampion)
      .judgmentRightTier(judgmentRightTier)
      .judgmentRightName(judgmentRightName)
      .judgmentRightLine(judgmentRightLine)
      .judgmentRightLike(judgmentRightLike)
      .judgmentVideo(judgmentVideo)
      .createdAt(createdAt)
      .updatedAt(updatedAt)
      .build();
  }

  toDTOList(judgmentEntities: Judgment[]): JudgmentDTO[] {
    const judgmentDTOList = [];
    judgmentEntities.forEach((judgmentEntity) =>
      judgmentDTOList.push(this.toDTO(judgmentEntity)),
    );

    return judgmentDTOList;
  }
}
