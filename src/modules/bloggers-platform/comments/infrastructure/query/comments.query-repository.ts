import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentLikesRepository } from '../comment-likes.repository';
import { GetCommentsQueryParamsInputDto } from '../../api/input-dto/get-comments-query-params.input.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: CommentModelType,
    private readonly commentLikesRepository: CommentLikesRepository,
  ) {}
  async getByIdOrNotFoundFail(
    id: string,
    userId?: string | null,
  ): Promise<CommentViewDto> {
    const comment = await this.commentModel.findOne({
      _id: id,
      deletedAt: null,
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
    console.log('COMMMMMMMENTS USER ID', userId);
    let myStatus = 'None';
    if (userId) {
      const like = await this.commentLikesRepository.find(
        userId,
        comment._id.toString(),
      );
      if (like) {
        myStatus = like.myStatus;
      }
    }

    return CommentViewDto.mapToView(comment, myStatus);
  }

  async getAllForPost(
    query: GetCommentsQueryParamsInputDto,
    postId: string,
    userId?: string | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter = {
      postId,
      deletedAt: null,
    };

    const comments = await this.commentModel
      .find(filter)
      //todo uncomment
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.commentModel.countDocuments(filter);

    const commentIds = comments.map((c) => c._id.toString());
    const likesInfo: Record<string, string> = {};

    if (userId) {
      const likes = await this.commentLikesRepository.findByAllId(
        commentIds,
        userId,
      );

      likes.forEach((l) => {
        likesInfo[l.commentId] = l.myStatus;
      });
    }

    const items = comments.map((comment) => {
      const myStatus = likesInfo[comment._id.toString()] || 'None';
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
