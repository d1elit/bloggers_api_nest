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
  UseGuards,
} from '@nestjs/common';

import { CreteBlogInputDto } from './input-dto/crete-blog.input-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
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
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { type UserContext } from '../../../user-accounts/guards/types';
import { BlogsPostCreateInputDto } from './input-dto/blogs-post-create.input-dto';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdatePostInputDto } from '../../posts/api/input-dto/update-post.input-dto';
import { UpdatePostCommand } from '../../posts/aplication/usecases/update-post.usecase';
import { DeletePostCommand } from '../../posts/aplication/usecases/delete-post.usecase';

@SkipThrottle()
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() body: CreteBlogInputDto) {
    const id = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return await this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogInputDto) {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string) {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }
  @UseGuards(BasicAuthGuard)
  @Get()
  async getBlogList(@Query() query: GetBlogsQueryParams) {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  async createPost(
    @Body() body: BlogsPostCreateInputDto,
    @Param('id') id: string,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostCommand(body, id),
    );
    return this.queryBus.execute(new GetPostByIdQuery(postId));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
    @Body() body: UpdatePostInputDto,
  ) {
    return this.commandBus.execute(new UpdatePostCommand(postId, blogId, body));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
  ) {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }

  @UseGuards(AccessOptionalGuard)
  @Get(':id/posts')
  async getPostList(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserFromRequest() user: UserContext,
  ) {
    const userId = user.userId;
    console.log('USER ID IN BLOGERS POSTS: ', userId);
    await this.queryBus.execute(new GetBlogByIdQuery(id));
    return this.queryBus.execute(
      new GetPostsQuery(query, { blogId: id, userId }),
    );
  }
}
