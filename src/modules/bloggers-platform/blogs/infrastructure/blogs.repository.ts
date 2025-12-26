import { Injectable } from '@nestjs/common';
import { BlogDocument } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  async save(blog: BlogDocument) {
    await blog.save();
  }
}
