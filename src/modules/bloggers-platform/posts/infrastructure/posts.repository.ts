import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async save(domainPost: Post) {
    return this.postRepo.save(domainPost);
  }

  async findById(id: string): Promise<Post | null> {
    return await this.postRepo.findOneBy({ id });
  }

  async findOrNotFoundFail(id: string): Promise<Post> {
    const post = await this.findById(id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'post',
            message: 'Post not found',
          },
        ],
      });
    }
    return post;
  }
}