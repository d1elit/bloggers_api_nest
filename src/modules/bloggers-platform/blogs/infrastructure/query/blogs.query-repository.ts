import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.blogRepo.findOneBy({ id });

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
    console.log(blog);
    return BlogViewDto.mapToView(blog);
  }

  async getAllOrm(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const queryBuilder = this.blogRepo.createQueryBuilder('b');

    queryBuilder.select([
      'id',
      'name',
      'description',
      'website_url as "websiteUrl"',
      'created_at as "createdAt" ',
      'is_membership  as "isMembership"',
    ]);

    if (query.searchNameTerm) {
      queryBuilder.orWhere('b.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`, // Добавляем проценты здесь
      });
    }
    if (query.searchDescriptionTerm) {
      queryBuilder.orWhere('b.description ILIKE :description', {
        description: `%${query.searchDescriptionTerm}%`, // Добавляем проценты здесь
      });
    }
    queryBuilder.skip(query.calculateSkip()).take(query.pageSize);

    queryBuilder.orderBy('b.createdAt', 'DESC');

    const sortField = query.sortBy || 'createdAt';

    const sortDirection =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`b.${sortField}`, sortDirection);

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
