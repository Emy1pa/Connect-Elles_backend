import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Favorite, FavoriteSchema } from './favorite.schema';
import { FavoriteService } from './favorites.service';
import { FavoriteController } from './favorites.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
    UsersModule,
    JwtModule,
  ],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class CategoriesModule {}
