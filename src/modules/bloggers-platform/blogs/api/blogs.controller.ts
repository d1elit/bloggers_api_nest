import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { GetPostsQuery } from '../../posts/aplication/queries/get-posts.query-handler';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdQuery } from '../aplication/queries/get-blog-by-id.query-handler';
import { GetBlogsQuery } from '../aplication/queries/get-blogs.query-handler';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { type UserContext } from '../../../user-accounts/guards/types';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getBlog(@Param('id') id: string) {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Get()
  async getBlogList(@Query() query: GetBlogsQueryParams) {
    return this.queryBus.execute(new GetBlogsQuery(query));
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
