import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsUrl } from 'class-validator';

export class CreteBlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;
  @IsStringWithTrim(1, 500)
  description: string;
  @IsStringWithTrim(1, 100)
  @IsUrl()
  websiteUrl: string;
}
