import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async saveOrm(domainComment: Comment) {
    return await this.commentRepo.save(domainComment);
  }

  async findById(id: string): Promise<Comment | null> {
    return await this.commentRepo.findOneBy({ id });
  }

  async findOrNotFoundFail(id: string): Promise<Comment> {
    const comment = await this.findById(id);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'comment',
            message: 'Comment not found',
          },
        ],
      });
    }
    return comment;
  }
}
