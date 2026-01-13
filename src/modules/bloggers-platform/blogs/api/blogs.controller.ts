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

import { CreteBlogInputDto } from './input-dto/crete-blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { GetPostsQuery } from '../../posts/aplication/queries/get-posts.query-handler';
import { CreatePostCommand } from '../../posts/aplication/usecases/create-post.usecase';
import { GetPostByIdQuery } from '../../posts/aplication/queries/get-post-by-id.query-handler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../aplication/usecases/create-blog.usecase';
import { GetBlogByIdQuery } from '../aplication/queries/get-blog-by-id.query-handler';
import { UpdateBlogCommand } from '../aplication/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../aplication/usecases/delete-blog.usecase';
import { GetBlogsQuery } from '../aplication/queries/get-blogs.query-handler';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createBlog(@Body() body: CreteBlogInputDto) {
    const id = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return await this.queryBus.execute(new GetBlogByIdQuery(id));
  }
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogInputDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }
  @Get()
  async getBlogList(@Query() query: GetBlogsQueryParams) {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }
  @Post(':id/posts')
  async createPost(@Body() body: CreatePostDto, @Param('id') id: string) {
    const postId = await this.commandBus.execute(
      new CreatePostCommand(body, id),
    );
    return this.queryBus.execute(new GetPostByIdQuery(postId));
  }
  @Get(':id/posts')
  async getPostList(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.queryBus.execute(new GetBlogByIdQuery(id));
    return this.queryBus.execute(new GetPostsQuery(query, id));
  }
}
