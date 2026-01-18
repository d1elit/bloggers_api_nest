import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post-entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikesRepository } from '../post-likes.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
    private postLikesRepository: PostLikesRepository,
  ) {}
  async getByIdOrNotFoundFail(id: string, likeStatus?: string) {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });

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

    return PostViewDto.mapToView(post, likeStatus);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: {
      deletedAt: null;
      blogId?: string;
      $or?: any[];
    } = {
      deletedAt: null,
    };
    if (blogId) {
      filter.blogId = blogId;
    }

    const orConditions: any[] = [];
    console.log('QUERY IN REPO', query);
    if (query.title) {
      console.log('Im in title');
      orConditions.push({
        title: { $regex: query.title, $options: 'i' },
      });
    }

    if (query.shortDescription) {
      orConditions.push({
        shortDescription: { $regex: query.shortDescription, $options: 'i' },
      });
    }
    if (query.content) {
      orConditions.push({
        content: { $regex: query.content, $options: 'i' },
      });
    }
    if (query.blogName) {
      orConditions.push({
        blogName: { $regex: query.blogName, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const posts = await this.postModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const postIds = posts.map((c) => c._id.toString());
    const likesInfo: Record<string, string> = {};
    console.log('USER ID IN REPOSITORY:', userId);
    if (userId) {
      const likes = await this.postLikesRepository.findByIds(postIds, userId);
      console.log('Likes ID IN REPOSITORY:', likes);
      likes.forEach((l) => {
        likesInfo[l.postId] = l.myStatus;
      });
      console.log('LIKES INFO:', likesInfo);
    }

    const items = posts.map((post) => {
      const myStatus = likesInfo[post._id.toString()];
      return PostViewDto.mapToView(post, myStatus);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
