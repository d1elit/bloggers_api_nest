import { CreatePostLikeDomainDto } from './dto/create-post-like.domain.dto';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('post_likes')
export class PostLike {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  public userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'post_id' })
  public postId: string;

  @Column({ type: 'varchar', name: 'user_login', collation: 'C' })
  public userLogin: string;

  @Column({ type: 'timestamp without time zone', name: 'added_at' })
  public addedAt: Date;

  @Column({ type: 'varchar', name: 'my_status', collation: 'C' })
  public myStatus: string;

  static createNew(dto: CreatePostLikeDomainDto): PostLike {
    const postLike = new PostLike();
    postLike.userId = dto.userId;
    postLike.postId = dto.postId;
    postLike.userLogin = dto.userLogin;
    postLike.addedAt = new Date();
    postLike.myStatus = dto.likeStatus;
    return postLike;
  }

  updateLikeStatus(likeStatus: string) {
    this.myStatus = likeStatus;
    this.addedAt = new Date(); // It seems `added_at` was updated on change in the original query
  }
}
