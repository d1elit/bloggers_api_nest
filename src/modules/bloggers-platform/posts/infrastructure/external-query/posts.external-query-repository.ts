import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string) {
    const raw = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!raw[0]) {
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

    return PostViewDto.mapToView(raw[0]);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const values: any[] = [];
    let where = `WHERE deleted_at IS NULL`;

    if (blogId) {
      values.push(blogId);
      where += ` AND blog_id = $${values.length}`;
    }

    if (query.title || query.shortDescription || query.content || query.blogName) {
      where += ` AND (`;
      const conditions: string[] = [];

      if (query.title) {
        values.push(`%${query.title}%`);
        conditions.push(`title ILIKE $${values.length}`);
      }

      if (query.shortDescription) {
        values.push(`%${query.shortDescription}%`);
        conditions.push(`short_description ILIKE $${values.length}`);
      }
      
      if (query.content) {
        values.push(`%${query.content}%`);
        conditions.push(`content ILIKE $${values.length}`);
      }
      
      if (query.blogName) {
        values.push(`%${query.blogName}%`);
        conditions.push(`blog_name ILIKE $${values.length}`);
      }

      where += conditions.join(` OR `) + `)`;
    }

    const whereParamsCount = values.length;

    // Mapping sorting
    const sortMap: Record<string, string> = {
      title: `title COLLATE "C"`,
      shortDescription: `short_description COLLATE "C"`,
      content: `content COLLATE "C"`,
      blogName: `blog_name COLLATE "C"`,
      createdAt: `created_at`,
    };

    const sortColumn = sortMap[query.sortBy] ?? `created_at`;
    const sortDirection = query.sortDirection?.toLowerCase() === `asc` ? `ASC` : `DESC`;

    values.push(query.pageSize);
    const limitIndex = values.length;

    values.push(query.calculateSkip());
    const offsetIndex = values.length;

    const dataQuery = `
      SELECT
        id, title, short_description, content,
        blog_id, blog_name, created_at, deleted_at,
        likes_count, dislikes_count, newest_likes
      FROM posts
      ${where}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM posts ${where}
    `;

    const postsResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(
      countQuery,
      values.slice(0, whereParamsCount),
    );

    const totalCount = Number(countResult[0].count);

    const items = postsResult.map((post: any) => PostViewDto.mapToView(post));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}

