import { BadRequestException, Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blog.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]),
    JwtModule,
    UsersModule,
    CategoriesModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'images', 'blogs');
          mkdirSync(uploadPath, { recursive: true });
          callback(null, uploadPath);
        },
        filename(req, file, callback) {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image')) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Unsupported file format'), false);
        }
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  ],
  providers: [BlogsService],
  controllers: [BlogsController],
})
export class BlogsModule {}
