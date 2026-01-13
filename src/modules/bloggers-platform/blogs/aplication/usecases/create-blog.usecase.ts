import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../../domain/blog-entity';
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
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand) {
    const entity = this.blogModel.createInstance(dto);
    await this.blogsRepository.save(entity);
    return entity._id.toString();
  }
}
