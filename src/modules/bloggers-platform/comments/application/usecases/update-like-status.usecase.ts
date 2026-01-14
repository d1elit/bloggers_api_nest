import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';
import {
  CommentLike,
  type CommentLikeModelType,
} from '../../domain/comment-like.entity';
import { InjectModel } from '@nestjs/mongoose';

export class UpdateLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<
  UpdateLikeStatusCommand,
  void
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private likesRepository: CommentLikesRepository,
    @InjectModel(CommentLike.name)
    private commentLike: CommentLikeModelType,
  ) {}

  async execute({
    commentId,
    userId,
    likeStatus,
  }: UpdateLikeStatusCommand): Promise<void> {
    const comment = await this.commentsRepository.findOrNotFoundFail(commentId);
    const like = await this.likesRepository.find(userId, commentId);

    if (!like) {
      const newLike = this.commentLike.createInstance(
        userId,
        commentId,
        likeStatus,
      );
      comment.updateLikeCount(likeStatus);
      await this.likesRepository.create(newLike);
    } else {
      if (likeStatus === like.myStatus) {
        return;
      }
      const oldStatus = like.myStatus;
      like.myStatus = likeStatus;
      comment.updateLikeCount(likeStatus, oldStatus);
      await this.likesRepository.update(like);
    }
    await this.commentsRepository.save(comment);
  }
}
