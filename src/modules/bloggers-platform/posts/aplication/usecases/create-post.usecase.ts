import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BlogsExternalRepository } from '../../../blogs/infrastructure/external/blogs.external-repository';

export class CreatePostCommand {
  constructor(
    public dto: CreatePostDto,
    public blogIdDto?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogExternalQueryRepository: BlogsExternalRepository,
  ) {}

  async execute({ dto, blogIdDto }: CreatePostCommand) {
    const blogId = blogIdDto ? blogIdDto : dto.blogId;
    const blog =
      await this.blogExternalQueryRepository.getByIdOrNotFoundFail(blogId);
    const entity = Post.createInstance(dto, blog);
    await this.postsRepository.save(entity);
    return entity.id;
  }
}
