import { InjectModel } from '@nestjs/mongoose';
import { BlogEntity, type BlogModelType } from '../../domain/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogEntity.name)
    private blogModel: BlogModelType,
  ) {}
  async getByIdOrNotFoundFail(id: string) {
    const blog = await this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('blog not found');
    }

    return BlogViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter: {
      deletedAt: null;
      $or?: any[];
    } = {
      deletedAt: null,
    };

    const orConditions: any[] = [];

    if (query.searchNameTerm) {
      orConditions.push({
        name: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    if (query.searchDescriptionTerm) {
      orConditions.push({
        description: { $regex: query.searchDescriptionTerm, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);

    const items = blogs.map((blog) => BlogViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
