import { Post } from '../../domain/post.entity';

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

  static mapToView(
    post: Post,
    myStatus?: string,
    newestLikes?: newestLikes[],
  ): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    dto.extendedLikesInfo = {
      likesCount: post.extendedLikesInfo.likesCount || 0,
      dislikesCount: post.extendedLikesInfo.dislikesCount || 0,
      myStatus: myStatus || 'None',
      newestLikes: newestLikes || [],
    };

    return dto;
  }
}
