import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 and "deleted_at" is NULL`,
      [id],
    );

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return UserViewDto.mapToView(user[0]);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const values: any[] = [];
    let where = 'WHERE deleted_at IS NULL';

    if (query.searchLoginTerm || query.searchEmailTerm) {
      where += ' AND (';
      const conditions: string[] = [];

      if (query.searchLoginTerm) {
        values.push(`%${query.searchLoginTerm}%`);
        conditions.push(`login ILIKE $${values.length}`);
      }

      if (query.searchEmailTerm) {
        values.push(`%${query.searchEmailTerm}%`);
        conditions.push(`email ILIKE $${values.length}`);
      }

      where += conditions.join(' OR ') + ')';
    }

    const allowedSortFields = ['login', 'email', 'created_at', 'updated_at'];

    const sortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'created_at';

    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';

    values.push(query.pageSize);
    const limitIndex = values.length;

    values.push(query.calculateSkip());
    const offsetIndex = values.length;

    const dataQuery = `
    SELECT *
    FROM users
    ${where}
    ORDER BY ${sortBy} ${sortDirection}
    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

    const countQuery = `
    SELECT COUNT(*) 
    FROM users
    WHERE 
    "deleted_at" IS NULL
  `;

    const usersResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(countQuery);

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
