import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, type BlogModelType } from '../../domain/blog-entity';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(
    @InjectModel(Blog.name)
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
}
