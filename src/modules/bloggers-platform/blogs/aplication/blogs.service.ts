import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  // async create(dto: CreteBlogInputDto): Promise<string> {
  //   const blog = Blog.createInstance(dto);
  //   await this.blogsRepository.save(blog);
  //   return blog.id;
  // }
  // async update(id: string, dto: UpdateBlogDto) {
  //   const blog = await this.blogsRepository.findOrNotFoundFail(id);
  //   blog.update(dto);
  //   return await this.blogsRepository.save(blog);
  // }
  // async delete(id: string): Promise<void> {
  //   const blog = await this.blogsRepository.findOrNotFoundFail(id);
  //   console.log(blog);
  //   blog.makeDeleted();
  //   return await this.blogsRepository.save(blog);
  // }
}
