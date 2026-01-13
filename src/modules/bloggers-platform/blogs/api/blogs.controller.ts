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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../aplication/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../aplication/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../aplication/usecases/delete-blog.usecase';
import { GetBlogByIdQuery } from '../aplication/queries/get-blog-by-id.query-handler';
import { GetBlogsQuery } from '../aplication/queries/get-blogs.query-handler';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postService: PostsService,
    private readonly postsExternalQueryRepository: PostsExternalQueryRepository,
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
