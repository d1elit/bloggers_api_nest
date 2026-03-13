import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPostByIdQuery } from '../aplication/queries/get-post-by-id.query-handler';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment.input-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-comment-by-id.query-handler';
import { AccessTokenGuard } from '../../../user-accounts/guards/bearer/access-token.guard';
import { GetPostsCommentQuery } from '../../comments/application/queries/get-comments-for-post.query-handler';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
// import { PostLikeStatusCommand } from '../aplication/usecases/post-like-status-use.case';

import { CommentViewDto } from '../../comments/api/view-dto/comment.view-dto';

import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParamsInputDto } from '../../comments/api/input-dto/get-comments-query-params.input.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('posts')
export class SaPostsController {
  constructor(
    private readonly commandBus: CommandBus,

    private readonly queryBus: QueryBus,
  ) {}

  // @UseGuards(BasicAuthGuard)
  // @Post()
  // async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
  //   const postId = await this.commandBus.execute<CreatePostCommand, string>(
  //     new CreatePostCommand(body),
  //   );
  //
  //   return this.queryBus.execute(new GetPostByIdQuery(postId));
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updatePost(
  //   @Param('id') id: string,
  //   @Body() body: UpdatePostInputDto,
  // ): Promise<void> {
  //   return this.commandBus.execute(new UpdatePostCommand(id, body));
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deletePost(@Param('id') id: string): Promise<void> {
  //   return this.commandBus.execute(new DeletePostCommand(id));
  // }

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

  // @UseGuards(AccessTokenGuard)
  // @Put(':id/like-status')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async postLike(
  //   @Param('id') postId: string,
  //   @Body() body: PostLikeStatusDto,
  //   @ExtractUserFromRequest() user: UserContextDto,
  // ): Promise<void> {
  //   const userId = user.userId;
  //
  //   return await this.commandBus.execute(
  //     new PostLikeStatusCommand(postId, userId, body.likeStatus),
  //   );
  // }
}
