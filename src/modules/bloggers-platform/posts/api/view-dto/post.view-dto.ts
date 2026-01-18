import { PostDocument } from '../../domain/post-entity';

export type newestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: newestLikes[];
  };

  static mapToView(post: PostDocument, myStatus?: string): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post._id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount,
      dislikesCount: post.extendedLikesInfo.dislikesCount,
      myStatus: myStatus || 'None',
      newestLikes: post.extendedLikesInfo.newestLikes,
    };

    return dto;
  }
}
