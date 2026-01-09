//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { IsEmail } from 'class-validator';

export class CreateUserInputDto {
  @IsStringWithTrim(3, 10)
  login: string;
  @IsStringWithTrim(6, 20)
  password: string;
  @IsStringWithTrim(5, 25)
  @IsEmail()
  email: string;
}
