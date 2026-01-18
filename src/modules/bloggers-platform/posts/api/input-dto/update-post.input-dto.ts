import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class UpdatePostInputDto {
  @IsStringWithTrim(1, 30)
  title: string;
  @IsStringWithTrim(1, 100)
  shortDescription: string;
  @IsStringWithTrim(1, 1000)
  content: string;
}
