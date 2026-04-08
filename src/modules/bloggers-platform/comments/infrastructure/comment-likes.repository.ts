import { Injectable } from '@nestjs/common';
import { CommentLike } from '../domain/comment-like.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private commentLikeRepo: Repository<CommentLike>,
  ) {}

  async find(
    userId: string | undefined,
    commentId: string,
  ): Promise<CommentLike | null> {
    if (!userId) return null;

    return await this.commentLikeRepo.findOneBy({
      userId,
      commentId,
    });
  }

  async create(like: CommentLike): Promise<CommentLike> {
    return await this.commentLikeRepo.save(like);
  }

  async update(like: CommentLike): Promise<CommentLike> {
    return await this.commentLikeRepo.save(like);
  }

  async findByAllId(
    ids: string[],
    userId: string | undefined,
  ): Promise<CommentLike[]> {
    if (!userId || !ids.length) return [];

    return await this.commentLikeRepo.find({
      where: {
        userId: userId,
        commentId: In(ids),
      },
    });
  }
}
