import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

import { PostsSortBy } from './posts-sort-by';
import { IsOptional, IsString } from 'class-validator';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  blogName?: string;
  @IsOptional()
  @IsString()
  blogId?: string;
}
