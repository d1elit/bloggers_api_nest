import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 and "deleted_at" is NULL`,
      [id],
    );
    console.log('finded user');
    console.log(user[0]);

    if (!user[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'User not found',
          },
        ],
      });
    }
    return UserViewDto.mapToView(user[0]);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const values: any[] = [];
    let where = `WHERE deleted_at IS NULL`;

    if (query.searchLoginTerm || query.searchEmailTerm) {
      where += ` AND (`;
      const conditions: string[] = [];

      if (query.searchLoginTerm) {
        values.push(`%${query.searchLoginTerm}%`);
        conditions.push(`login ILIKE $${values.length}`);
      }

      if (query.searchEmailTerm) {
        values.push(`%${query.searchEmailTerm}%`);
        conditions.push(`email ILIKE $${values.length}`);
      }

      where += conditions.join(` OR `) + `)`;
    }

    const whereParamsCount = values.length;

    // mapping сортировки
    const sortMap: Record<string, string> = {
      login: `login COLLATE "C"`,
      email: `email COLLATE "C"`,
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
        login,
        email,
        created_at
      FROM users
             ${where}
      ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM users
             ${where}
    `;

    const usersResult = await this.dataSource.query(dataQuery, values);

    const countResult = await this.dataSource.query(
      countQuery,
      values.slice(0, whereParamsCount),
    );

    const totalCount = Number(countResult[0].count);

    const items = usersResult.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
