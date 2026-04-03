import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { Comment } from '../../domain/comment.entity';

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
  ) {}

  async execute({
    content,
    userId,
    postId,
  }: CreateCommentCommand): Promise<string> {
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);

    const comment = Comment.createInstance(content, userId, postId);

    await this.commentsRepository.saveOrm(comment);
    return comment.id;
  }
}
