import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateLikeStatusInputDto } from './input-dto/update-like-status.input-dto';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';

import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { UpdateLikeStatusCommand } from '../application/usecases/update-like-status.usecase';

import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { AccessTokenGuard } from '../../../user-accounts/guards/bearer/access-token.guard';
import { AccessOptionalGuard } from '../../../user-accounts/guards/bearer/access-optional.guard';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('comments')
export class PublicCommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(AccessOptionalGuard)
  @Get(':id')
  async getComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    const userId = user.userId;
    return this.queryBus.execute(new GetCommentByIdQuery(id, userId));
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user,
  ) {
    return this.commandBus.execute(
      new UpdateCommentCommand(id, user.userId, body.content),
    );
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') id: string, @ExtractUserFromRequest() user) {
    return this.commandBus.execute(new DeleteCommentCommand(id, user.userId));
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('id') id: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user,
  ) {
    return this.commandBus.execute(
      new UpdateLikeStatusCommand(id, user.userId, body.likeStatus),
    );
  }
}
