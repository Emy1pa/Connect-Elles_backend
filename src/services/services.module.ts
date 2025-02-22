import { BadRequestException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { Service, ServiceSchema } from './service.schema';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    JwtModule,
    UsersModule,
    CategoriesModule,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = join(process.cwd(), 'images', 'services');
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
  providers: [ServicesService],
  controllers: [ServicesController],
})
export class ServicesModule {}
