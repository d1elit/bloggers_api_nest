import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class NewPasswordInputDto {
  @IsStringWithTrim(0, 40)
  recoveryCode: string;
  @IsStringWithTrim(6, 20)
  newPassword: string;
}
