import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CommentInputDto {
  @IsStringWithTrim(20, 300)
  content: string;
}
