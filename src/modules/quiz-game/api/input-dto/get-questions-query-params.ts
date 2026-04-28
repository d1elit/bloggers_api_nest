import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { QuestionsSortBy } from './questions-sort-by';

export class GetQuestionsQueryParams extends BaseQueryParams {
  sortBy = QuestionsSortBy.CreatedAt;
  bodySearchTerm: string | null = null;
  publishedStatus: 'all' | 'published' | 'notPublished' | null = null;
}
