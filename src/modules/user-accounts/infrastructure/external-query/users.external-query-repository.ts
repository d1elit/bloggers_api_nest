import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersExternalQueryRepository {
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
            message: 'UserEntity not found',
          },
        ],
      });
    }
    return UserViewDto.mapToView(user[0]);
  }
}
