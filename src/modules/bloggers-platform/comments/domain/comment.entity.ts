import { randomUUID } from 'crypto';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../../user-accounts/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';

export class LikesInfo {
  constructor(likesCount: number, dislikesCount: number) {
    this.likesCount = likesCount;
    this.dislikesCount = dislikesCount;
  }
  @Column({ name: 'likes_count', default: 0 })
  public likesCount: number;
  @Column({ name: 'dislikes_count', default: 0 })
  public dislikesCount: number;
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public content: string;

  @Column({ name: 'created_at' })
  public createdAt: Date;

  @Column({ name: 'post_id', type: 'uuid' })
  public postId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  public userId: string;

  @Column(() => LikesInfo, { prefix: false })
  public likesInfo: LikesInfo;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: Date | null;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  static createInstance(
    content: string,
    userId: string,
    postId: string,
  ): Comment {
    const comment = new Comment();
    comment.id = randomUUID();
    comment.content = content;
    comment.postId = postId;
    comment.userId = userId;
    comment.likesInfo = new LikesInfo(0, 0);
    comment.createdAt = new Date();
    comment.deletedAt = null;

    return comment;
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
