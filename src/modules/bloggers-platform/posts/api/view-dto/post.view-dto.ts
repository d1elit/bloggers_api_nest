import { PostsMapper } from '../../infrastructure/posts-mapper';

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

  static mapToView(postRow: any, myStatus?: string): PostViewDto {
    const postDomain = PostsMapper.toDomain(postRow);
    const dto = new PostViewDto();
    dto.id = postDomain.id;
    dto.title = postDomain.title;
    dto.shortDescription = postDomain.shortDescription;
    dto.content = postDomain.content;
    dto.blogId = postDomain.blogId;
    dto.blogName = postDomain.blogName;
    dto.createdAt = postDomain.createdAt;
    // dto.extendedLikesInfo = {
    //   dislikesCount: 0,
    //   likesCount: 0,
    //   myStatus: 'None',
    //   newestLikes: [],
    // };
    dto.extendedLikesInfo = {
      likesCount: postDomain.extendedLikesInfo.likesCount,
      dislikesCount: postDomain.extendedLikesInfo.dislikesCount,
      myStatus: myStatus || 'None',
      newestLikes: [],
      // newestLikes: postDomain.extendedLikesInfo.newestLikes,
    };

    return dto;
  }
}
