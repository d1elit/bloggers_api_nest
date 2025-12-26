import { Body, Controller, Post } from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';

import { BlogInputDto } from './input-dto/blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() body: BlogInputDto) {
    const blogId = await this.blogsService.create(body);
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
