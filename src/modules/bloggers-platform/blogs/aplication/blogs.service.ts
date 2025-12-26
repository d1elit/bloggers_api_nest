import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { BlogEntity, type BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(BlogEntity.name)
    private blogModel: BlogModelType,
  ) {}
  async create(dto: CreateBlogDto): Promise<string> {
    const blog = this.blogModel.createInstance(dto);
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }
}
