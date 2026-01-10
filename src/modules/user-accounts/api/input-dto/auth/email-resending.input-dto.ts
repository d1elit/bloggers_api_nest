import { IsEmail, IsString } from 'class-validator';

export class EmailResendingInputDto {
  @IsEmail()
  @IsString()
  email: string;
}
