import {
  CommentatorInfo,
  CommentDomain,
  LikesInfo,
} from '../domain/comment.entity-domain';

export class CommentsMapper {
  static toDomain(row: any): CommentDomain {
    return new CommentDomain(
      row.id,
      row.content,
      new CommentatorInfo(row.user_id, row.user_login),
      row.created_at,
      row.post_id,
      new LikesInfo(row.likes_count || 0, row.dislikes_count || 0),
      row.deleted_at,
    );
  }

  static toPersistence(comment: CommentDomain) {
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
