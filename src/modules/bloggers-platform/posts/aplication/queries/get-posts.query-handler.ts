
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';

export class GetPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public blogId?: string,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetPostsQuery) {
    return this.postsQueryRepository.getAll(query.queryParams, query.blogId);
  }
}
