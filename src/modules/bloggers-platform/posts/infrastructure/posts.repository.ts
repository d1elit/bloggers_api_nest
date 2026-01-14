import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostDocument, Post, type PostModelType } from '../domain/post-entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
  ) {}
  async save(post: PostDocument) {
    await post.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    console.log('findById', id);
    return this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);
    console.log(post);
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
