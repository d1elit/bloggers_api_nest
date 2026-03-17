import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
// import { PostLikeStatusCommand } from '../aplication/usecases/post-like-status-use.case';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('posts')
export class AdminPostsController {
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
