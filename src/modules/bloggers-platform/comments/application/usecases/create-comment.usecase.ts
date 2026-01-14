import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { UsersQueryRepository } from '../../../../user-accounts/infrastructure/query/users.query-repository';
import { InjectModel } from '@nestjs/mongoose';

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
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    private commentsRepository: CommentsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({
    content,
    userId,
    postId,
  }: CreateCommentCommand): Promise<string> {
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    const user = await this.usersQueryRepository.getByIdOrNotFoundFail(userId);

    const comment = this.commentModel.createInstance(
      content,
      userId,
      user.login,
      postId,
    );

    await this.commentsRepository.save(comment);
    return comment._id.toString();
  }
}
