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
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostDto } from '../dto/create-post.dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../aplication/usecases/create-post.usecase';
import { GetPostByIdQuery } from '../aplication/queries/get-post-by-id.query-handler';
import { UpdatePostCommand } from '../aplication/usecases/update-post.usecase';
import { DeletePostCommand } from '../aplication/usecases/delete-post.usecase';
import { GetPostsQuery } from '../aplication/queries/get-posts.query-handler';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment.input-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetCommentByIdQuery } from '../../comments/application/queries/get-comment-by-id.query-handler';
import { AccessTokenGuard } from '../../../user-accounts/guards/bearer/access-token.guard';
import { GetPostsCommentQuery } from '../../comments/application/queries/get-comments-for-post.query-handler';
import { GetBlogByIdQuery } from '../../blogs/aplication/queries/get-blog-by-id.query-handler';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createPost(@Body() body: CreatePostInputDto) {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(body),
    );
    return this.queryBus.execute(new GetPostByIdQuery(postId));
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.commandBus.execute(new UpdatePostCommand(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePostCommand(id));
  }

  @Get()
  async getPostList(@Query() query: GetPostsQueryParams) {
    return this.queryBus.execute(new GetPostsQuery(query));
  }

  @UseGuards(AccessTokenGuard)
  @Post(':id/comments')
  async createComment(
    @Param('id') postId: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user,
  ) {
    console.log(user);
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(body.content, user.userId, postId),
    );
    return this.queryBus.execute(new GetCommentByIdQuery(commentId));
  }

  @Get(':id/comments')
  async getPostComments(
    @Param('id') postId: string,
    @Query() query: GetPostsQueryParams,
  ) {
    await this.queryBus.execute(new GetPostByIdQuery(postId));
    return await this.queryBus.execute(new GetPostsCommentQuery(query, postId));
  }
}
