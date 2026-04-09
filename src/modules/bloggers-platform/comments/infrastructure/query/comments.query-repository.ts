import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentLikesRepository } from '../comment-likes.repository';
import { GetCommentsQueryParamsInputDto } from '../../api/input-dto/get-comments-query-params.input.dto';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    private readonly commentLikesRepository: CommentLikesRepository,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const comment = await this.commentRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { user: true },
    });
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

    let myStatus = 'None';
    if (userId) {
      const like = await this.commentLikesRepository.find(userId, id);
      if (like) {
        myStatus = like.myStatus;
      }
    }

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAll(
    query: GetCommentsQueryParamsInputDto,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .where('c.postId = :postId', { postId })
      .andWhere('c.deletedAt IS NULL');

    const sortColumn =
      query.sortBy === 'content'
        ? 'c.content COLLATE "C"'
        : `c.${query.sortBy || 'createdAt'}`;
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortColumn, sortDirection);

    qb.skip(query.calculateSkip()).take(query.pageSize);

    const comments = await qb.getMany();
    const totalCount = await qb.getCount();

    const likesInfo: Record<string, string> = {};
    if (userId && comments.length > 0) {
      const commentIds = comments.map((c) => c.id);
      const likes = await this.commentLikesRepository.findByAllId(
        commentIds,
        userId,
      );
      likes.forEach((l) => {
        likesInfo[l.commentId] = l.myStatus;
      });
    }

    const items = comments.map((comment) => {
      const myStatus = likesInfo[comment.id] || 'None';

      return CommentViewDto.mapToView(comment, myStatus);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
