
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';

export class GetCommentByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<
GetCommentByIdQuery,
  CommentViewDto
> {
  constructor(public commentsQueryRepository: CommentsQueryRepository) {}

  async execute(query: GetCommentByIdQuery) {
    return await this.commentsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
