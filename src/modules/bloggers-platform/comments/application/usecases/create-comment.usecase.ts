import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment } from '../../domain/comment.entity';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { UsersExternalRepository } from '../../../../user-accounts/infrastructure/users.external.repository';

export class CreateCommentCommand {
  constructor(
    public content: string,
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersExternalRepository: UsersExternalRepository,
  ) {}

  async execute({
    content,
    userId,
    postId,
  }: CreateCommentCommand): Promise<string> {
    console.log(`CREATE COMMENT: `, content);
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    console.log(`CREATE COMMENT 2: `, content);
    console.log('USER ID ', userId);
    const user = await this.usersExternalRepository.findOrNotFoundFail(userId);

    const comment = Comment.createInstance(content, userId, user.login, postId);
    console.log('COMMENT BEFORE SAVE', comment);
    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
