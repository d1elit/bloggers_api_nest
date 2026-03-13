import { randomUUID } from 'crypto';

export class CommentatorInfo {
  constructor(
    public userId: string,
    public userLogin: string,
  ) {}
}

export class LikesInfo {
  constructor(
    public likesCount: number,
    public dislikesCount: number,
  ) {}
}

export class Comment {
  constructor(
    public id: string,
    public content: string,
    public commentatorInfo: CommentatorInfo,
    public createdAt: string,
    public postId: string,
    public likesInfo: LikesInfo,
    public deletedAt: Date | null,
  ) {}

  static createInstance(
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
  ): Comment {
    return new Comment(
      randomUUID(),
      content,
      new CommentatorInfo(userId, userLogin),
      new Date().toISOString(),
      postId,
      new LikesInfo(0, 0),
      null,
    );
  }

  update(content: string): void {
    this.content = content;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateLikeCount(newStatus: string, oldStatus?: string): void {
    if (oldStatus === 'Like') this.likesInfo.likesCount -= 1;
    if (oldStatus === 'Dislike') this.likesInfo.dislikesCount -= 1;

    if (newStatus === 'Like') this.likesInfo.likesCount += 1;
    if (newStatus === 'Dislike') this.likesInfo.dislikesCount += 1;
  }
}

export type CommentDocument = Comment;
export type CommentModelType = never;
