import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParamsInputDto } from '../../api/input-dto/get-comments-query-params.input.dto';

export class GetPostsCommentQuery {
  constructor(
    public queryParams: GetCommentsQueryParamsInputDto,
    public postId: string,
    public userId?: string,
  ) {}
}

@QueryHandler(GetPostsCommentQuery)
export class GetPostsCommentQueryHandler implements IQueryHandler<
  GetPostsCommentQuery,
  PaginatedViewDto<CommentViewDto[]>
> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}
  async execute(query: GetPostsCommentQuery) {
    return this.commentsQueryRepository.getAll(
      query.queryParams,
      query.postId,
      query.userId,
    );
  }
}
