import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';

export type GetPostsQueryOptions = {
  blogId?: string;
  userId?: string;
};

export class GetPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public options: GetPostsQueryOptions = {},
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler implements IQueryHandler<
  GetPostsQuery,
  PaginatedViewDto<PostViewDto[]>
> {
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}
  async execute(query: GetPostsQuery) {
    console.log(query.options);
    const { blogId, userId } = query.options;
    return this.postsQueryRepository.getAll(query.queryParams, blogId, userId);
  }
}
