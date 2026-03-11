import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string) {
    const raw = await this.dataSource.query(
      `SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (!raw[0]) {
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

    return BlogViewDto.mapToView(raw[0]);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const values: any[] = [];
    let where = `WHERE deleted_at IS NULL`;

    if (query.searchNameTerm || query.searchDescriptionTerm) {
      where += ` AND (`;
      const conditions: string[] = [];

      if (query.searchNameTerm) {
        values.push(`%${query.searchNameTerm}%`);
        conditions.push(`name ILIKE $${values.length}`);
      }

      if (query.searchDescriptionTerm) {
        values.push(`%${query.searchDescriptionTerm}%`);
        conditions.push(`description ILIKE $${values.length}`);
      }

      where += conditions.join(` OR `) + `)`;
    }

    const whereParamsCount = values.length;

    // Mapping sorting
    const sortMap: Record<string, string> = {
      name: `name COLLATE "C"`,
      description: `description COLLATE "C"`,
      websiteUrl: `website_url COLLATE "C"`,
      createdAt: `created_at`,
    };

    const sortColumn = sortMap[query.sortBy] ?? `created_at`;

    const sortDirection =
      query.sortDirection?.toLowerCase() === `asc` ? `ASC` : `DESC`;

    values.push(query.pageSize);
    const limitIndex = values.length;

    values.push(query.calculateSkip());
    const offsetIndex = values.length;

    const dataQuery = `
      SELECT
        id,
        name,
        description,
        website_url,
        created_at,
        is_membership,
        deleted_at
      FROM blogs
      ${where}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM blogs
      ${where}
    `;

    const blogsResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(
      countQuery,
      values.slice(0, whereParamsCount),
    );

    const totalCount = Number(countResult[0].count);
    const items = blogsResult.map((blog: any) => BlogViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
