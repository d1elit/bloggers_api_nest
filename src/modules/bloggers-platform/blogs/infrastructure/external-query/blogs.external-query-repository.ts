import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(private dataSource: DataSource) {}
  async getByIdOrNotFoundFail(id: string) {
    if (!id) {
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
}
