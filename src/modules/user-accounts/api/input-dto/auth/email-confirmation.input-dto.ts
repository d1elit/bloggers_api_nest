import { IsUUID } from 'class-validator';

export class EmailConfirmationInputDto {
  @IsUUID()
  code: string;
}
