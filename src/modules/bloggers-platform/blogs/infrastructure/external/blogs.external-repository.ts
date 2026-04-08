import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogsExternalRepository {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}
  async getByIdOrNotFoundFail(id: string) {
    const blog = await this.blogRepo.findOneBy({ id });
    console.log(blog);
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
