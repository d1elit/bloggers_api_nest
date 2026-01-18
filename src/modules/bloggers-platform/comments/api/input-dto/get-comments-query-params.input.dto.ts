import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from '../../../blogs/api/input-dto/blogs-sort-by';
import { CommentsSortBy } from './comments-sort-by';

export class GetCommentsQueryParamsInputDto extends BaseQueryParams {
  sortBy = CommentsSortBy.CreatedAt;
  // searchNameTerm: string | null = null;
  // searchDescriptionTerm: string | null = null;
}
