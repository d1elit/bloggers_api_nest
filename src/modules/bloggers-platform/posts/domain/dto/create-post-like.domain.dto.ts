import { PostLikeStatusDto } from '../../api/input-dto/post-like-status.input-dto';

export type CreatePostLikeDomainDto = {
  userId: string;
  postId: string;
  userLogin: string;
  likeStatus: string;
};
