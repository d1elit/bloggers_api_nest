import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreatePostLikeDomainDto } from './dto/create-post-like.domain.dto';

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ default: () => new Date() })
  addedAt: Date;

  @Prop({
    required: true,
    enum: ['Like', 'Dislike', 'None'],
  })
  myStatus: string;

  static createNew(dto: CreatePostLikeDomainDto): PostLike {
    const like = new PostLike();
    like.userId = dto.userId;
    like.postId = dto.postId;
    like.userLogin = dto.userLogin;
    like.myStatus = dto.likeStatus;
    return like;
  }

  updateLikeStatus(likeStatus: string) {
    this.myStatus = likeStatus;
  }
}

export type PostLikeDocument = HydratedDocument<PostLike>;

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

PostLikeSchema.loadClass(PostLike);
