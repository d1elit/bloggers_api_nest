
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { UpdatePostDto } from '../../dto/create-post.dto';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<
  UpdatePostCommand,
  void
> {
  constructor(private postsRepository: PostsRepository) {}
  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(dto);
    return await this.postsRepository.save(post);
  }
}
