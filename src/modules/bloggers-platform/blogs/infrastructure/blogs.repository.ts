import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async save(domainBlog: Blog) {
    return this.blogRepo.save(domainBlog);
  }

  async findById(id: string): Promise<Blog | null> {
    return await this.blogRepo.findOneBy({ id });
  }

  async findOrNotFoundFail(id: string): Promise<Blog> {
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
