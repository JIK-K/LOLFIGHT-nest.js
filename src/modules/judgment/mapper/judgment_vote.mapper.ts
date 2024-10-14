import { Injectable } from '@nestjs/common';
import { Builder } from 'builder-pattern';
import { Judgment } from '../entities/judgment.entity';
import { JudgmentDTO } from '../DTOs/judgment.dto';
import { JudgmentVote } from '../entities/judgment_vote.entity';
import { JudgmentVoteDTO } from '../DTOs/judgment_vote.dto';

@Injectable()
export class JudgmentVoteMapper {
  constructor() {}

  toDTO(judgmentVoteEntity: JudgmentVote): JudgmentVoteDTO {
    const { id, judgment, member, voteSide } = judgmentVoteEntity;

    return Builder<JudgmentVoteDTO>()
      .id(id)
      .judgmentId(judgment)
      .memberId(member)
      .voteSide(voteSide)
      .build();
  }

  toDTOList(judgmentVoteEntities: JudgmentVote[]): JudgmentVoteDTO[] {
    const judgmentVoteDTOList = [];
    judgmentVoteEntities.forEach((judgmentVoteEntity) =>
      judgmentVoteDTOList.push(this.toDTO(judgmentVoteEntity)),
    );

    return judgmentVoteDTOList;
  }
}
