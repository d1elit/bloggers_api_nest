import { Injectable } from '@nestjs/common';
import { CommentLike } from '../domain/comment-like.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentLikesRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(CommentLike)
    private commentLikeRepo: Repository<CommentLike>,
  ) {}

  // private mapToDomain(row: any): CommentLike {
  //   return new CommentLike(
  //     row.user_id,
  //     row.comment_id,
  //     row.my_status,
  //     row.added_at,
  //   );
  // }

  async find(
    userId: string | undefined,
    commentId: string,
  ): Promise<CommentLike | null> {
    if (!userId) return null;

    return await this.commentLikeRepo.findOneBy({ commentId });
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
    // 1. Быстрая проверка
    if (!userId || !ids.length) return [];

    // 2. Используем метод find с оператором In
    return await this.commentLikeRepo.find({
      where: {
        userId: userId,
        commentId: In(ids), // Автоматически превращается в WHERE comment_id IN (...)
      },
    });

    // 3. Мапим в домен (если это необходимо)
    // Если commentLikeRepo возвращает сущности, которые и есть домен,
    // можно просто вернуть 'likes'
  }
}
