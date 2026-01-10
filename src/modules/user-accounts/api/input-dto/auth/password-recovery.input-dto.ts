import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import { IsEmail } from 'class-validator';

export class PasswordRecoveryInputDto {
  @IsStringWithTrim(0, 40)
  @IsEmail()
  email: string;
}
