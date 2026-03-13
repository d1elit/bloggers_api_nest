import { Injectable } from '@nestjs/common';
import { PostLike } from '../domain/post-like.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PostLikesRepository {
  constructor(private dataSource: DataSource) {}

  private mapToDomain(row: any): PostLike {
    return new PostLike(
      row.user_id,
      row.post_id,
      row.user_login,
      row.added_at,
      row.my_status,
    );
  }

  async find(
    userId: string | undefined,
    postId: string,
  ): Promise<PostLike | null> {
    if (!userId) return null;
    const raw = await this.dataSource.query(
      `SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId],
    );
    if (!raw[0]) return null;
    return this.mapToDomain(raw[0]);
  }

  async create(like: PostLike) {
    await this.dataSource.query(
      `
      INSERT INTO post_likes (user_id, post_id, user_login, added_at, my_status)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [like.userId, like.postId, like.userLogin, like.addedAt, like.myStatus],
    );
  }

  async update(like: PostLike) {
    console.log('++++++++++++UPDATE POST LIKE+++++++++++++++');
    await this.dataSource.query(
      `
      UPDATE post_likes
      SET my_status = $1, added_at = $2
      WHERE user_id = $3 AND post_id = $4
      `,
      [like.myStatus, like.addedAt, like.userId, like.postId],
    );
  }

  async findLastLikes(postId: string): Promise<PostLike[] | null> {
    const raw = await this.dataSource.query(
      `
      SELECT * FROM post_likes
      WHERE post_id = $1 AND my_status = 'Like'
      ORDER BY added_at DESC
      LIMIT 3
      `,
      [postId],
    );
    if (!raw.length) return null;
    return raw.map(this.mapToDomain);
  }

  async findByIds(
    ids: string[],
    userId: string | undefined,
  ): Promise<PostLike[]> {
    if (!userId || !ids.length) return [];

    // Create parameterized list like $2, $3, $4
    const params = ids.map((_, i) => `$${i + 2}`).join(', ');

    const raw = await this.dataSource.query(
      `
      SELECT * FROM post_likes
      WHERE user_id = $1 AND post_id IN (${params})
      `,
      [userId, ...ids],
    );
    return raw.map(this.mapToDomain);
  }
}
