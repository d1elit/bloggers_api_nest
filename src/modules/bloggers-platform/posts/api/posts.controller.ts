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
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { PostsService } from '../aplication/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { UpdatePostDto } from '../dto/create-post.dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  @Post()
  async createPost(@Body() body: CreatePostInputDto) {
    const postId = await this.postService.create(body);
    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.postService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    return this.postService.delete(id);
  }

  @Get()
  async getPostList(@Query() query: GetPostsQueryParams) {
    console.log('query:', query);
    return this.postsQueryRepository.getAll(query);
  }
}
