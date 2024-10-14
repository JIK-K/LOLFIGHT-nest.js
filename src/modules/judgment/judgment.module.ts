import { Module } from '@nestjs/common';
import { JudgmentController } from './judgment.controller';
import { JudgmentService } from './judgment.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Judgment } from './entities/judgment.entity';
import { JudgmentMapper } from './mapper/judgment.mapper';
import { JudgmentVote } from './entities/judgment_vote.entity';
import { JudgmentVoteMapper } from './mapper/judgment_vote.mapper';
import { Member } from '../member/entities/member.entity';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Judgment]),
    TypeOrmModule.forFeature([JudgmentVote]),
    TypeOrmModule.forFeature([Member]),
  ],
  controllers: [JudgmentController],
  providers: [JudgmentService, JudgmentMapper, JudgmentVoteMapper],
  exports: [JudgmentService, JudgmentMapper, JudgmentVoteMapper],
})
export class JudgmentModule {}
