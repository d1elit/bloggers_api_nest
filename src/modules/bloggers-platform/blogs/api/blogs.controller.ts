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
  Query,
} from '@nestjs/common';
import { BlogsService } from '../aplication/blogs.service';

import { CreteBlogInputDto } from './input-dto/crete-blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { PostsService } from '../../posts/aplication/posts.service';
import { PostsExternalQueryRepository } from '../../posts/infrastructure/external-query/posts.external-query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postService: PostsService,
    private readonly postsExternalQueryRepository: PostsExternalQueryRepository,
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
  @Get()
  async getBlogList(@Query() query: GetBlogsQueryParams) {
    console.log('query:', query);
    return this.blogsQueryRepository.getAll(query);
  }
  @Post(':id/posts')
  async createPost(@Body() body: CreatePostDto, @Param('id') id: string) {
    const postId = await this.postService.create(body, id);
    return this.postsExternalQueryRepository.getByIdOrNotFoundFail(postId);
  }
  @Get(':id/posts')
  async getPostList(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(id);
    return this.postsExternalQueryRepository.getAll(query, id);
  }
}
