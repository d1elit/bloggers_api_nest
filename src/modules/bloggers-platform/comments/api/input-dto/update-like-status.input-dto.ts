
import { IsIn } from 'class-validator';

export class UpdateLikeStatusInputDto {
  @IsIn(['None', 'Like', 'Dislike'])
  likeStatus: string;
}
