import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post, type PostModelType } from '../../domain/post-entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/external-query/blogs.external-query-repository';

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
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly blogExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async execute({ dto, blogIdDto }: CreatePostCommand) {
    const blogId = blogIdDto ? blogIdDto : dto.blogId;
    const blog =
      await this.blogExternalQueryRepository.getByIdOrNotFoundFail(blogId);
    const entity = this.postModel.createInstance(dto, blog);
    await this.postsRepository.save(entity);
    return entity._id.toString();
  }
}
