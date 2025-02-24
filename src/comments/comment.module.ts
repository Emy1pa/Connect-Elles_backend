import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  imports: [],
  exports: [],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
