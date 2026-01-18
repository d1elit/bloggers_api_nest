import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/post.view-dto';

export class GetPostByIdQuery {
  constructor(
    public id: string,
    public likeStatus?: string,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<
  GetPostByIdQuery,
  PostViewDto
> {
  constructor(public postsQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostByIdQuery) {
    return await this.postsQueryRepository.getByIdOrNotFoundFail(
      query.id,
      query.likeStatus,
    );
  }
}
