import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { GetPostByIdQuery } from '../aplication/queries/get-post-by-id.query-handler';

import { GetPostsQuery } from '../aplication/queries/get-posts.query-handler';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
import { PostViewDto } from './view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { SkipThrottle } from '@nestjs/throttler';
import { AccessTokenGuard } from '../../../user-accounts/guards/bearer/access-token.guard';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-comment-by-id.query-handler';
import { GetCommentsQueryParamsInputDto } from '../../comments/api/input-dto/get-comments-query-params.input.dto';
import { GetPostsCommentQuery } from '../../comments/application/queries/get-comments-for-post.query-handler';
import { PostLikeStatusDto } from './input-dto/post-like-status.input-dto';
import { PostLikeStatusCommand } from '../aplication/usecases/post-like-status-use.case';

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

  @UseGuards(AccessTokenGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') postId: string,

    @Body() body: CreateCommentInputDto,

    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(body.content, user.userId, postId),
    );

    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
  }

  @UseGuards(AccessOptionalGuard)
  @Get(':id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Query() query: GetCommentsQueryParamsInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const userId = user.userId;
    await this.queryBus.execute(new GetPostByIdQuery(postId));
    return await this.queryBus.execute(
      new GetPostsCommentQuery(query, postId, userId),
    );
  }
  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async postLike(
    @Param('id') postId: string,
    @Body() body: PostLikeStatusDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    const userId = user.userId;

    return await this.commandBus.execute(
      new PostLikeStatusCommand(postId, userId, body.likeStatus),
    );
  }
}
