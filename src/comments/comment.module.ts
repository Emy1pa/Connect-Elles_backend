import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './comment.schema';
import { UsersModule } from 'src/users/users.module';
import { BlogsModule } from 'src/blogs/blogs.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    UsersModule,
    BlogsModule,
    JwtModule,
  ],
  exports: [],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
