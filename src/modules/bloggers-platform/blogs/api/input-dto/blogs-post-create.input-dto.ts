import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsString } from 'class-validator';

export class BlogsPostCreateInputDto {
  @IsStringWithTrim(1, 30)
  title: string;
  @IsStringWithTrim(1, 100)
  shortDescription: string;
  @IsStringWithTrim(1, 1000)
  content: string;
  blogId: string;
}
