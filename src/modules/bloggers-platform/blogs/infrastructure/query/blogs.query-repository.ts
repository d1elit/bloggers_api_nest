import { InjectModel } from '@nestjs/mongoose';
import { BlogEntity, type BlogModelType } from '../../domain/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(BlogEntity.name)
    private blogModel: BlogModelType,
  ) {}
  async getByIdOrNotFoundFail(id: string) {
    const blog = await this.blogModel.findOne({ _id: id });
    if (!blog) {
      throw new NotFoundException('Invalid blog');
    }

    return BlogViewDto.mapToView(blog);
  }
}
