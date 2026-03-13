import { CreatePostLikeDomainDto } from './dto/create-post-like.domain.dto';

export class PostLike {
  constructor(
    public userId: string,
    public postId: string,
    public userLogin: string,
    public addedAt: Date,
    public myStatus: string,
  ) {}

  static createNew(dto: CreatePostLikeDomainDto): PostLike {
    return new PostLike(
      dto.userId,
      dto.postId,
      dto.userLogin,
      new Date(),
      dto.likeStatus,
    );
  }

  updateLikeStatus(likeStatus: string) {
    this.myStatus = likeStatus;
  }
}
