import { Post, ExtendedLikesInfo } from '../domain/post-entity';

export class PostsMapper {
  static toDomain(row: any): Post {
    return new Post(
      row.id,
      row.title,
      row.short_description,
      row.content,
      row.blog_id,
      row.blog_name,
      row.created_at,
      row.deleted_at,
      // {
      //   likesCount: row.likes_count || 0,
      //   dislikesCount: row.dislikes_count || 0,
      //   myStatus: 'None',
      //   newestLikes: row.newest_likes ? (typeof row.newest_likes === 'string' ? JSON.parse(row.newest_likes) : row.newest_likes) : [],
      // }
    );
  }

  static toPersistence(post: Post) {
    return {
      id: post.id,
      title: post.title,
      short_description: post.shortDescription,
      content: post.content,
      blog_id: post.blogId,
      blog_name: post.blogName,
      created_at: post.createdAt,
      deleted_at: post.deletedAt,
      // likes_count: post.extendedLikesInfo.likesCount,
      // dislikes_count: post.extendedLikesInfo.dislikesCount,
      // newest_likes: JSON.stringify(post.extendedLikesInfo.newestLikes),
    };
  }
}
