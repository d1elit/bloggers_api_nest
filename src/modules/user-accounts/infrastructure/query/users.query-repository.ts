import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/users/get-users-query-params.input-dto';
import { Repository } from 'typeorm';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'login', 'email', 'createdAt'], // Выберет только эти колонки
    });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'UserEntity not found',
          },
        ],
      });
    }
    return user;
  }

  async getAll(query: GetUsersQueryParams) {
    const queryBuilder = this.userRepo.createQueryBuilder('u'); // Даем алиас 'u'

    queryBuilder.select([
      'id',
      'login',
      '"email"',
      'created_at as "createdAt"',
    ]);

    if (query.searchEmailTerm) {
      queryBuilder.orWhere('u.email ILIKE :email', {
        email: `%${query.searchEmailTerm}%`, // Добавляем проценты здесь
      });
    }

    if (query.searchLoginTerm) {
      queryBuilder.orWhere('u.login ILIKE :login', {
        login: `%${query.searchLoginTerm}%`,
      });
    }
    queryBuilder.skip(query.calculateSkip()).take(query.pageSize);

    queryBuilder.orderBy('u.createdAt', 'DESC');

    const sortField = query.sortBy || 'createdAt';

    const sortDirection =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`u.${sortField}`, sortDirection);

    const items = await queryBuilder.getRawMany();

    const totalCount = await queryBuilder.getCount();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
