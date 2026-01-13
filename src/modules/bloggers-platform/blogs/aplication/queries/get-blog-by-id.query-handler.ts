import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<
  GetBlogByIdQuery,
  BlogViewDto
> {
  constructor(public blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogByIdQuery) {
    return await this.blogsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
