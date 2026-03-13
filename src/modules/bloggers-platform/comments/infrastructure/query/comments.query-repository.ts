import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentLikesRepository } from '../comment-likes.repository';
import { GetCommentsQueryParamsInputDto } from '../../api/input-dto/get-comments-query-params.input.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    private dataSource: DataSource,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const raw = await this.dataSource.query(
      `SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (!raw[0]) {
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

    console.log('COMMMMMMMENTS USER ID', userId);
    let myStatus = 'None';
    if (userId) {
      const like = await this.commentLikesRepository.find(userId, id);
      if (like) {
        myStatus = like.myStatus;
      }
    }

    return CommentViewDto.mapToView(raw[0], myStatus);
  }

  async getAllForPost(
    query: GetCommentsQueryParamsInputDto,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const values: any[] = [postId];
    const where = `WHERE post_id = $1 AND deleted_at IS NULL`;

    // Mapping sorting
    const sortMap: Record<string, string> = {
      content: `content COLLATE "C"`,
      createdAt: `created_at`,
    };

    const sortColumn = sortMap[query.sortBy] ?? `created_at`;
    const sortDirection =
      query.sortDirection?.toLowerCase() === `asc` ? `ASC` : `DESC`;

    values.push(query.pageSize);
    const limitIndex = values.length;

    values.push(query.calculateSkip());
    const offsetIndex = values.length;

    const dataQuery = `
      SELECT *
      FROM comments
      ${where}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM comments
      ${where}
    `;

    const commentsResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(
      countQuery,
      values.slice(0, 1),
    );

    const totalCount = Number(countResult[0].count);

    const commentIds = commentsResult.map((c: any) => c.id);
    const likesInfo: Record<string, string> = {};

    if (userId && commentIds.length > 0) {
      const likes = await this.commentLikesRepository.findByAllId(
        commentIds,
        userId,
      );

      likes.forEach((l) => {
        likesInfo[l.commentId] = l.myStatus;
      });
    }

    const items = commentsResult.map((comment: any) => {
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
