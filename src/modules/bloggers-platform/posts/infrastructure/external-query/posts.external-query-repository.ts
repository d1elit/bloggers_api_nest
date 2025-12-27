import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post-entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private postModel: PostModelType,
  ) {}
  async getByIdOrNotFoundFail(id: string) {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('blog not found');
    }

    return PostViewDto.mapToView(post);
  }
  async getAll(
    query: GetPostsQueryParams,
    blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: {
      deletedAt: null;
      $or?: any[];
    } = {
      deletedAt: null,
    };

    const orConditions: any[] = [];
    console.log('QUERY IN REPO', query);
    if (query.title) {
      console.log('Im in title');
      orConditions.push({
        title: { $regex: query.title, $options: 'i' },
      });
    }
    if (blogId) {
      console.log('MARKED BLOG', blogId);
      orConditions.push({
        blogId: { $regex: blogId, $options: 'i' },
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

    const items = posts.map((post) => PostViewDto.mapToView(post));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
