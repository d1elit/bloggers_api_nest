import { BlogDomain } from '../../domain/blog.domain-entity';
import { CreteBlogInputDto } from '../../api/input-dto/crete-blog.input-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreteBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand) {
    const entity = BlogDomain.createInstance(dto);
    await this.blogsRepository.save(entity);
    return entity.id;
  }
}
