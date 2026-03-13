import { BlogViewDto } from '../../blogs/api/view-dto/blogs.view-dto';
import {
  CreatePostDomainDto,
  UpdatePostDomainDto,
} from './dto/create-post.domain.dto';
import { randomUUID } from 'crypto';

export type NewestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLike[];
};

export class Post {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    public deletedAt: Date | null,
    public extendedLikesInfo: ExtendedLikesInfo,
  ) {}

  static createInstance(dto: CreatePostDomainDto, blog: BlogViewDto): Post {
    return new Post(
      randomUUID(),
      dto.title,
      dto.shortDescription,
      dto.content,
      blog.id,
      blog.name,
      new Date().toISOString(),
      null,
      {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    );
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
    this.extendedLikesInfo.newestLikes = likes;
  }
}
