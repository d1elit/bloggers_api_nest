import { UserMongo } from '../../domain/user-mongo.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users/get-users-query-params.input-dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    // @InjectModel(User.name)
    // private UserModel: UserModelType,
    private dataSource: DataSource,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    // const user = await this.UserModel.findOne({
    //   _id: id,
    //   deletedAt: null,
    // });
    const user = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 and "deletedAt" is NULL`,
      [id],
    );

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  // async getAll(
  //   query: GetUsersQueryParams,
  // ): Promise<PaginatedViewDto<UserViewDto[]>> {
  //   const filter: {
  //     deletedAt: null;
  //     $or?: any[];
  //   } = {
  //     deletedAt: null,
  //   };
  //
  //   if (query.searchLoginTerm) {
  //     filter.$or = filter.$or || [];
  //     filter.$or.push({
  //       login: { $regex: query.searchLoginTerm, $options: 'i' },
  //     });
  //   }
  //
  //   if (query.searchEmailTerm) {
  //     filter.$or = filter.$or || [];
  //     filter.$or.push({
  //       email: { $regex: query.searchEmailTerm, $options: 'i' },
  //     });
  //   }
  //
  //   const users = await this.UserModel.find(filter)
  //     .sort({ [query.sortBy]: query.sortDirection })
  //     .skip(query.calculateSkip())
  //     .limit(query.pageSize);
  //
  //   const totalCount = await this.UserModel.countDocuments(filter);
  //
  //   const items = users.map(UserViewDto.mapToView);
  //
  //   return PaginatedViewDto.mapToView({
  //     items,
  //     totalCount,
  //     page: query.pageNumber,
  //     size: query.pageSize,
  //   });
  // }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const values: any[] = [];
    let where = 'WHERE "deletedAt" IS NULL';

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

    // ⚠️ ВАЖНО: sortBy нельзя передавать как параметр $!
    const allowedSortFields = ['login', 'email', '"createdAt"', 'updatedAt'];

    const sortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : '"createdAt"';

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
    "deletedAt" IS NULL
  `;

    const usersResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(countQuery);
    // console.log(countResult);

    const totalCount = Number(countResult[0].count);

    console.log(dataQuery);

    const items = usersResult.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
