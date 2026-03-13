import { CommentsMapper } from '../../infrastructure/comments-mapper';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(commentRow: any, myStatus: string = 'None'): CommentViewDto {
    const commentDomain = CommentsMapper.toDomain(commentRow);
    const dto = new CommentViewDto();
    dto.id = commentDomain.id;
    dto.content = commentDomain.content;
    dto.commentatorInfo = {
      userId: commentDomain.commentatorInfo.userId,
      userLogin: commentDomain.commentatorInfo.userLogin,
    };
    dto.createdAt = commentDomain.createdAt;
    dto.likesInfo = {
      likesCount: commentDomain.likesInfo.likesCount,
      dislikesCount: commentDomain.likesInfo.dislikesCount,
      myStatus,
    };
    return dto;
  }
}
