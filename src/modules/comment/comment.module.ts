import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentMapper } from './mapper/comment.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { Board } from '../board/entities/board.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([Post]),
    TypeOrmModule.forFeature([Board]),
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentMapper],
  exports: [CommentService, CommentMapper],
})
export class CommentModule {}
