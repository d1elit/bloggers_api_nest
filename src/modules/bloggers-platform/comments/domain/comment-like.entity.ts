import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ collection: 'comment-likes' })
export class CommentLike {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  commentId!: string;

  @Prop({ required: true })
  myStatus!: string;

  static createInstance(
    this: CommentLikeModelType,
    userId: string,
    commentId: string,
    myStatus: string,
  ): CommentLikeDocument {
    const like = new this();
    like.userId = userId;
    like.commentId = commentId;
    like.myStatus = myStatus;
    return like as CommentLikeDocument;
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
