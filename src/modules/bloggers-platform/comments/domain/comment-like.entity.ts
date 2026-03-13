export class CommentLike {
  constructor(
    public userId: string,
    public commentId: string,
    public myStatus: string,
    public addedAt: Date,
  ) {}

  static createInstance(
    userId: string,
    commentId: string,
    myStatus: string,
  ): CommentLike {
    return new CommentLike(userId, commentId, myStatus, new Date());
  }
}

export type CommentLikeDocument = CommentLike;
export type CommentLikeModelType = never;
