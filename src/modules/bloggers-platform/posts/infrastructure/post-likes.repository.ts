import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/post-like.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private postLikeRepo: Repository<PostLike>,
  ) {}

  async find(
    userId: string | undefined,
    postId: string,
  ): Promise<PostLike | null> {
    if (!userId) return null;
    return await this.postLikeRepo.findOneBy({
      userId,
      postId,
    });
  }

  async create(like: PostLike) {
    await this.postLikeRepo.save(like);
  }

  async update(like: PostLike) {
    await this.postLikeRepo.save(like);
  }

  async findLastLikes(postId: string): Promise<PostLike[] | null> {
    const likes = await this.postLikeRepo.find({
      where: { postId, myStatus: 'Like' },
      relations: {
        user: true, //
      },
      order: { addedAt: 'DESC' },
      take: 3,
    });

    if (!likes.length) return null;
    return likes;
  }

  async findByIds(
    ids: string[],
    userId: string | undefined,
  ): Promise<PostLike[]> {
    if (!userId || !ids.length) return [];

    return await this.postLikeRepo.find({
      where: {
        userId,
        postId: In(ids),
      },
    });
  }
}
