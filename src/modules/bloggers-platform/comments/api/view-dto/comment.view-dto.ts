import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(
    comment: Comment,
    myStatus: string = 'None',
  ): CommentViewDto {
    // const commentDomain = CommentsMapper.toDomain(commentRow);
    const dto = new CommentViewDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.user.id,
      userLogin: comment.user.login,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus,
    };
    return dto;
  }
}
