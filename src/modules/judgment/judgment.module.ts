import { Module } from '@nestjs/common';
import { JudgmentController } from './judgment.controller';
import { JudgmentService } from './judgment.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Judgment } from './entities/judgment.entity';
import { JudgmentMapper } from './mapper/judgment.mapper';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([Judgment])],
  controllers: [JudgmentController],
  providers: [JudgmentService, JudgmentMapper],
  exports: [JudgmentService, JudgmentMapper],
})
export class JudgmentModule {}
