import { GetQuestionsQueryParams } from '../../../api/input-dto/get-questions-query-params';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from '../../../api/view-dto/question.view-dto';
import { QuestionsQueryRepository } from '../../../infrastructure/query/questions.query-repository';

export class GetQuestionsQuery {
  constructor(public queryParams: GetQuestionsQueryParams) {}
}
@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler implements IQueryHandler<
  GetQuestionsQuery,
  PaginatedViewDto<QuestionViewDto[]>
> {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
  ) {}
  async execute(query: GetQuestionsQuery) {
    return this.questionsQueryRepository.getAll(query.queryParams);
  }
}
