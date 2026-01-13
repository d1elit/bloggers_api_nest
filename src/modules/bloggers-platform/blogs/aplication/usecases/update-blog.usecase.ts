import { CreteBlogInputDto } from '../../api/input-dto/crete-blog.input-dto';
import { UpdateBlogInputDto } from '../../api/input-dto/update-blog.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Types } from 'mongoose';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogInputDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<
  UpdateBlogCommand,
  void
> {
  constructor(private blogsRepository: BlogsRepository) {}
  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.update(dto);
    return await this.blogsRepository.save(blog);
  }
}
