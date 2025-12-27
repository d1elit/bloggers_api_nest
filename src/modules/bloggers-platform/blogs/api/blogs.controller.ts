import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';

import { CreteBlogInputDto } from './input-dto/crete-blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Post()
  async createBlog(@Body() body: CreteBlogInputDto) {
    const blogId = await this.blogsService.create(body);
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    console.log(id);
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogInputDto) {
    return await this.blogsService.update(id, body);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return await this.blogsService.delete(id);
  }
}
