import { Injectable } from '@nestjs/common';
import { CommentLike } from '../domain/comment-like.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentLikesRepository {
  constructor(private dataSource: DataSource) {}

  private mapToDomain(row: any): CommentLike {
    return new CommentLike(
      row.user_id,
      row.comment_id,
      row.my_status,
      row.added_at,
    );
  }

  async find(
    userId: string | undefined,
    commentId: string,
  ): Promise<CommentLike | null> {
    if (!userId) return null;
    const raw = await this.dataSource.query(
      `SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId],
    );
    if (!raw[0]) return null;
    return this.mapToDomain(raw[0]);
  }

  async create(like: CommentLike): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO comment_likes (user_id, comment_id, my_status, added_at)
      VALUES ($1, $2, $3, $4)
      `,
      [like.userId, like.commentId, like.myStatus, like.addedAt],
    );
  }

  async update(like: CommentLike): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE comment_likes
      SET my_status = $1, added_at = $2
      WHERE user_id = $3 AND comment_id = $4
      `,
      [like.myStatus, like.addedAt, like.userId, like.commentId],
    );
  }

  async findByAllId(
    ids: string[],
    userId: string | undefined,
  ): Promise<CommentLike[]> {
    if (!userId || !ids.length) return [];

    const params = ids.map((_, i) => `$${i + 2}`).join(', ');

    const raw = await this.dataSource.query(
      `
      SELECT * FROM comment_likes
      WHERE user_id = $1 AND comment_id IN (${params})
      `,
      [userId, ...ids],
    );
    return raw.map((r) => this.mapToDomain(r));
  }
}
