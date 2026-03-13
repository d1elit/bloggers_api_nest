import { Comment, CommentatorInfo, LikesInfo } from '../domain/comment.entity';

export class CommentsMapper {
  static toDomain(row: any): Comment {
    return new Comment(
      row.id,
      row.content,
      new CommentatorInfo(row.user_id, row.user_login),
      row.created_at,
      row.post_id,
      new LikesInfo(row.likes_count || 0, row.dislikes_count || 0),
      row.deleted_at,
    );
  }

  static toPersistence(comment: Comment) {
    return {
      id: comment.id,
      content: comment.content,
      user_id: comment.commentatorInfo.userId,
      user_login: comment.commentatorInfo.userLogin,
      created_at: comment.createdAt,
      post_id: comment.postId,
      likes_count: comment.likesInfo.likesCount,
      dislikes_count: comment.likesInfo.dislikesCount,
      deleted_at: comment.deletedAt,
    };
  }
}
