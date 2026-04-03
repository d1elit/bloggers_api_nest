import { Injectable } from '@nestjs/common';
import { CommentDomain } from '../domain/comment.entity-domain';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DataSource, Repository } from 'typeorm';
import { CommentsMapper } from './comments-mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async saveOrm(domainComment: Comment) {
    return await this.commentRepo.save(domainComment);
  }

  async save(domainComment: CommentDomain) {
    const comment = CommentsMapper.toPersistence(domainComment);

    await this.dataSource.query(
      `
        INSERT INTO comments (
          id, content, user_id, user_login, created_at, post_id, likes_count, dislikes_count, deleted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id)
        DO UPDATE SET
          content = EXCLUDED.content,
          likes_count = EXCLUDED.likes_count,
          dislikes_count = EXCLUDED.dislikes_count,
          deleted_at = EXCLUDED.deleted_at
      `,
      [
        comment.id,
        comment.content,
        comment.user_id,
        comment.user_login,
        comment.created_at,
        comment.post_id,
        comment.likes_count,
        comment.dislikes_count,
        comment.deleted_at,
      ],
    );
    return comment;
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
