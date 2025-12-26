import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/aplication/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';

@Module({
  imports: [],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository],
  exports: [],
})
export class BloggersPlatformModule {}
