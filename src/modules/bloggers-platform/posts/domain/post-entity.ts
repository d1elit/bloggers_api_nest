import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import {
  CreatePostDomainDto,
  UpdatePostDomainDto,
} from './dto/create-post.domain.dto';
import { BlogViewDto } from '../../blogs/api/view-dto/blogs.view-dto';

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

@Schema({ _id: false })
class NewestLikeSchema {
  @Prop({ required: true })
  addedAt!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  login!: string;
}

@Schema({ _id: false })
class ExtendedLikesInfoSchema {
  @Prop({ default: 0 })
  likesCount!: number;

  @Prop({ default: 0 })
  dislikesCount!: number;

  @Prop({ default: 'None' })
  myStatus!: string;

  @Prop({ type: [NewestLikeSchema], default: [] })
  newestLikes!: NewestLike[];
}

@Schema({ collection: 'posts' })
export class Post {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  blogId!: string;

  @Prop({ required: true })
  blogName!: string;

  @Prop({ required: true })
  createdAt!: string;
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  @Prop({ type: ExtendedLikesInfoSchema, default: () => ({}) })
  extendedLikesInfo!: ExtendedLikesInfo;

  static createInstance(
    this: PostModelType,
    dto: CreatePostDomainDto,
    blog: BlogViewDto,
  ): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = blog.id;
    post.blogName = blog.name;
    post.createdAt = new Date().toISOString();
    post.deletedAt = null;
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };
    return post as PostDocument;
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

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
