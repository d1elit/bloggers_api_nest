import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogViewDto } from '../../blogs/api/view-dto/blogs.view-dto';
import {
  CreatePostDomainDto,
  UpdatePostDomainDto,
} from './dto/create-post.domain.dto';
import { randomUUID } from 'crypto';
import { Blog } from '../../blogs/domain/blog.entity';
import { PostLike } from './post-like.entity';

export class NewestLike {
  addedAt: string;
  userId: string;
  login: string;
}

export class ExtendedLikesInfo {
  @Column({ type: 'integer', name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ type: 'integer', name: 'dislikes_count', default: 0 })
  dislikesCount: number;

  myStatus: string;

  @Column({
    type: 'jsonb',
    name: 'newest_likes',
    default: () => "'[]'",
  })
  newestLikes: NewestLike[];
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', collation: 'C' })
  public title: string;

  @Column({ type: 'varchar', name: 'short_description', collation: 'C' })
  public shortDescription: string;

  @Column({ type: 'varchar', collation: 'C' })
  public content: string;

  @Column({ type: 'uuid', name: 'blog_id' })
  public blogId: string;

  @Column({ type: 'varchar', name: 'blog_name', collation: 'C' })
  public blogName: string;

  @Column({ type: 'timestamp without time zone', name: 'created_at' })
  public createdAt: string;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: Date | null;

  @Column(() => ExtendedLikesInfo, { prefix: false })
  public extendedLikesInfo: ExtendedLikesInfo;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blog_id' })
  public blog: Blog;

  @OneToMany(() => PostLike, (postLike) => postLike.post, { cascade: true })
  postLikes: PostLike[];

  static createInstance(dto: CreatePostDomainDto, blog: BlogViewDto): Post {
    const post = new Post();
    post.id = randomUUID();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blog.id;
    post.blogName = blog.name;
    post.createdAt = new Date().toISOString();
    post.deletedAt = null;

    post.extendedLikesInfo = new ExtendedLikesInfo();
    post.extendedLikesInfo.likesCount = 0;
    post.extendedLikesInfo.dislikesCount = 0;
    post.extendedLikesInfo.myStatus = 'None';
    post.extendedLikesInfo.newestLikes = [];

    return post;
  }

  update(dto: UpdatePostDomainDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateLikeCount(newStatus: string, oldStatus?: string): void {
    if (oldStatus === 'Like') this.extendedLikesInfo.likesCount -= 1;
    if (oldStatus === 'Dislike') this.extendedLikesInfo.dislikesCount -= 1;

    if (newStatus === 'Like') this.extendedLikesInfo.likesCount += 1;
    if (newStatus === 'Dislike') this.extendedLikesInfo.dislikesCount += 1;
  }

  updateNewestLikes(likes: NewestLike[]): void {
    console.log(likes);

    this.extendedLikesInfo.newestLikes = likes;
  }
}
