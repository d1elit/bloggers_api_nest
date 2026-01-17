import { Injectable } from '@nestjs/common';
import { PostLike, PostLikeDocument } from '../domain/post-like.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
  ) {}

  async find(
    userId: string | undefined,
    postId: string,
  ): Promise<PostLikeDocument | null> {
    const like = await this.postLikeModel.findOne({
      userId: userId,
      postId: postId,
    });

    if (!like) return null;
    return like;
  }

  async create(like: PostLike) {
    await this.postLikeModel.create(like);
    return;
  }
  async update(like: PostLikeDocument) {
    await like.save();
    return;
  }

  async findLastLikes(postId: string): Promise<PostLikeDocument[] | null> {
    console.log(postId);
    return this.postLikeModel
      .find({
        postId: postId,
        myStatus: 'Like',
      })
      .sort({ addedAt: -1 })
      .limit(3);
  }

  async findByIds(ids: string[], userId: string | undefined) {
    return this.postLikeModel.find({
      postId: { $in: ids },
      userId: userId,
    });
  }
}
