import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { BlogDomain } from '../domain/blog.domain-entity';
import { DataSource } from 'typeorm';
import { BlogsMapper } from './blogs-mapper';

@Injectable()
export class BlogsRepository {
  constructor(private dataSource: DataSource) {}

  async save(domainBlog: BlogDomain) {
    const blog = BlogsMapper.toPersistence(domainBlog);
    await this.dataSource.query(
      `
        INSERT INTO blogs (
          id, name, description, website_url,
          created_at, is_membership, deleted_at
        )
        VALUES (
                 $1,$2,$3,$4,
                 $5,$6,$7
               )
          ON CONFLICT (id)
    DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          website_url = EXCLUDED.website_url,
          is_membership = EXCLUDED.is_membership,
          deleted_at = EXCLUDED.deleted_at
      `,
      [
        blog.id,
        blog.name,
        blog.description,
        blog.website_url,
        blog.created_at,
        blog.is_membership,
        blog.deleted_at,
      ],
    );
    return blog;
  }

  async findById(id: string): Promise<BlogDomain | null> {
    const raw = await this.dataSource.query(
      `SELECT * FROM blogs
                WHERE id = $1 and "deleted_at" IS NULL `,
      [id],
    );
    if (!raw[0]) {
      return null;
    }
    return BlogsMapper.toDomain(raw[0]);
  }

  async findOrNotFoundFail(id: string): Promise<BlogDomain> {
    const blog = await this.findById(id);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'blog',
            message: 'Blog not found',
          },
        ],
      });
    }
    return blog;
  }
}
