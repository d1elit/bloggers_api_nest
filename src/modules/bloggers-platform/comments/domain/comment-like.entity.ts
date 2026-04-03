import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('comment_likes')
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  public userId: string;

  @Column({ name: 'comment_id', type: 'uuid' })
  public commentId: string;

  @Column({ name: 'my_status' })
  public myStatus: string;

  @Column({ type: 'timestamp without time zone', name: 'added_at' })
  public addedAt: Date;

  static createInstance(
    userId: string,
    commentId: string,
    myStatus: string,
  ): CommentLike {
    const commentLike = new CommentLike();
    commentLike.id = randomUUID();
    commentLike.userId = userId;
    commentLike.commentId = commentId;
    commentLike.myStatus = myStatus;
    commentLike.addedAt = new Date();
    return commentLike;
  }
}
