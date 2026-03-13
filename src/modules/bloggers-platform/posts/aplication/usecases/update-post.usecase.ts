import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdatePostDto } from '../../dto/create-post.dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute({ postId, blogId, dto }: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    if (post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'blog',
            message: 'Blog not found',
          },
        ],
      });
    }
    post.update(dto);
    await this.postsRepository.save(post);
  }
}
