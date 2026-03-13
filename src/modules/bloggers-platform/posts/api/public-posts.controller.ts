import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetPostByIdQuery } from '../aplication/queries/get-post-by-id.query-handler';

import { GetPostsQuery } from '../aplication/queries/get-posts.query-handler';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
import { PostViewDto } from './view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('posts')
export class PublicPostsController {
  constructor(
    private readonly commandBus: CommandBus,

    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(AccessOptionalGuard)
  @Get(':id')
  async getPost(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PostViewDto> {
    const likeStatus = user.likeStatus;

    return this.queryBus.execute(new GetPostByIdQuery(id, likeStatus));
  }

  @UseGuards(AccessOptionalGuard)
  @Get()
  async getPostList(
    @Query() query: GetPostsQueryParams,

    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const userId = user.userId;

    return this.queryBus.execute(new GetPostsQuery(query, { userId: userId }));
  }
}
