import { CreatePostLikeDomainDto } from './dto/create-post-like.domain.dto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../user-accounts/domain/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
export class PostLike {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  public userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'post_id' })
  public postId: string;

  @Column({ type: 'timestamp without time zone', name: 'added_at' })
  public addedAt: Date;

  @Column({ type: 'varchar', name: 'my_status', collation: 'C' })
  public myStatus: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  static createNew(dto: CreatePostLikeDomainDto): PostLike {
    const postLike = new PostLike();
    postLike.userId = dto.userId;
    postLike.postId = dto.postId;
    postLike.addedAt = new Date();
    postLike.myStatus = dto.likeStatus;
    return postLike;
  }

  updateLikeStatus(likeStatus: string) {
    this.myStatus = likeStatus;
    this.addedAt = new Date();
  }
}
