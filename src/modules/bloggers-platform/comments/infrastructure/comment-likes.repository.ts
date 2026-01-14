import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  type CommentLikeModelType,
} from '../domain/comment-like.entity';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: CommentLikeModelType,
  ) {}

  async find(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.commentLikeModel.findOne({ userId, commentId });
  }

  async create(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }

  async update(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }
}
