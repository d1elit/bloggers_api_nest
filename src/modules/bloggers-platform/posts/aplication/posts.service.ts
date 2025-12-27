import { InjectModel } from '@nestjs/mongoose';

import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, type PostModelType } from '../domain/post-entity';
import { CreatePostDto, UpdatePostDto } from '../dto/create-post.dto';
import { BlogsExternalQueryRepository } from '../../blogs/infrastructure/external-query/blogs.external-query-repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,

    @InjectModel(Post.name)
    private postModel: PostModelType,
    private readonly blogExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async create(postDto: CreatePostDto, blogIdDto?: string): Promise<string> {
    const blogId = blogIdDto ? blogIdDto : postDto.blogId;
    const blog =
      await this.blogExternalQueryRepository.getByIdOrNotFoundFail(blogId);
    const post = this.postModel.createInstance(postDto, blog);
    console.log(post);
    await this.postsRepository.save(post);
    return post._id.toString();
  }
  async update(id: string, postDto: UpdatePostDto) {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(postDto);
    return await this.postsRepository.save(post);
  }
  async delete(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    return this.postsRepository.save(post);
  }
}
