import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLike } from '../../domain/post-like.entity';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { UsersExternalRepository } from '../../../../user-accounts/infrastructure/users.external.repository';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly likeStatus: string,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase implements ICommandHandler<UpdatePostLikeStatusCommand> {
  constructor(
    private readonly postLikesRepository: PostLikesRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersExternalRepository: UsersExternalRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findById(command.postId);
    const user = await this.usersExternalRepository.findOrNotFoundFail(
      command.userId,
    );
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    const like = await this.postLikesRepository.find(
      command.userId,
      command.postId,
    );

    if (!like) {
      const newLike = PostLike.createNew({
        likeStatus: command.likeStatus,
        postId: command.postId,
        userId: command.userId,
        userLogin: user!.login,
      });

      await this.postLikesRepository.create(newLike);
      return;
    }

    like.updateLikeStatus(command.likeStatus);

    await this.postLikesRepository.update(like);
  }
}
