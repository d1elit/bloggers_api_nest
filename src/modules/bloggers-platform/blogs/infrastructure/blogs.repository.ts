import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogDocument, Blog, type BlogModelType } from '../domain/blog-entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: BlogModelType,
  ) {}
  async save(blog: BlogDocument) {
    await blog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    console.log('findById', id);
    return this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);
    console.log(blog);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return blog;
  }
}
