import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userLogin!: string;
}

@Schema({ _id: false })
class LikesInfo {
  @Prop({ default: 0 })
  likesCount!: number;

  @Prop({ default: 0 })
  dislikesCount!: number;

  @Prop({ default: 'None' })
  myStatus!: string;
}

@Schema({ collection: 'comments' })
export class Comment {
  @Prop({ required: true })
  content!: string;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo!: CommentatorInfo;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true })
  postId!: string;

  @Prop({ type: LikesInfo, default: () => ({}) })
  likesInfo!: LikesInfo;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(
    this: CommentModelType,
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
  ): CommentDocument {
    const comment = new this();
    comment.content = content;
    comment.commentatorInfo = {
      userId,
      userLogin,
    };
    comment.createdAt = new Date().toISOString();
    comment.postId = postId;
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
    };
    comment.deletedAt = null;
    return comment as CommentDocument;
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

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
