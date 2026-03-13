import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Post } from '../domain/post-entity';
import { DataSource } from 'typeorm';
import { PostsMapper } from './posts-mapper';

@Injectable()
export class PostsRepository {
  constructor(private dataSource: DataSource) {}

  async save(domainPost: Post) {
    const post = PostsMapper.toPersistence(domainPost);
    await this.dataSource.query(
      `
        INSERT INTO posts (
          id, title, short_description, content,
          blog_id, blog_name, created_at, deleted_at
       
        )
        VALUES (
                 $1,$2,$3,$4,
                 $5,$6,$7,$8
              
               )
          ON CONFLICT (id)
    DO UPDATE SET
          title = EXCLUDED.title,
          short_description = EXCLUDED.short_description,
          content = EXCLUDED.content,
          blog_id = EXCLUDED.blog_id,
          blog_name = EXCLUDED.blog_name,
          deleted_at = EXCLUDED.deleted_at
--           likes_count = EXCLUDED.likes_count,
--           dislikes_count = EXCLUDED.dislikes_count,
--           newest_likes = EXCLUDED.newest_likes
      `,
      [
        post.id,
        post.title,
        post.short_description,
        post.content,
        post.blog_id,
        post.blog_name,
        post.created_at,
        post.deleted_at,
        // post.likes_count,
        // post.dislikes_count,
        // post.newest_likes,
      ],
    );
    return post;
  }

  async findById(id: string): Promise<Post | null> {
    const raw = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!raw[0]) {
      return null;
    }
    return PostsMapper.toDomain(raw[0]);
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'post',
            message: 'Post not found',
          },
        ],
      });
    }
    return post;
  }
}
