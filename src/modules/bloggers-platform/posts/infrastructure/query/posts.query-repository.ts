import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikesRepository } from '../post-likes.repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/post.entity';
import { PostLike } from '../../domain/post-like.entity';

export type NewestLikeView = {
  addedAt: string;
  userId: string;
  login: string;
};

@Injectable()
export class PostsQueryRepository {
  constructor(
    private postLikesRepository: PostLikesRepository,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepo: Repository<PostLike>,
  ) {}

  async getByIdOrNotFoundFail(id: string, likeStatus?: string) {
    const post = await this.postRepo.findOneBy({ id });

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

    const likes = await this.postLikeRepo.find({
      where: { postId: id, myStatus: 'Like' },
      relations: {
        user: true, //
      },
      order: { addedAt: 'DESC' },
      take: 3,
    });

    const newestLikes: NewestLikeView[] = likes.map((like: any) => ({
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.user.login,
    }));

    return PostViewDto.mapToView(post, likeStatus, newestLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const queryBuilder = this.postRepo.createQueryBuilder('p');

    queryBuilder.select([
      'p.id as "id"',
      'p.title as "title"',
      'p.short_description as "shortDescription"',
      'p.content as "content"',
      'p.blog_id as "blogId"',
      'p.blog_name as "blogName"',
      'p.created_at as "createdAt"',
      'p.likes_count as "likesCount"',
      'p.dislikes_count as "dislikesCount"',
      'p.newest_likes as "newestLikes"',
    ]);

    if (blogId) {
      queryBuilder.andWhere('p.blog_id = :blogId', { blogId });
    }

    if (
      query.title ||
      query.shortDescription ||
      query.content ||
      query.blogName
    ) {
      queryBuilder.andWhere((qb) => {
        const conditions: string[] = [];
        const params: Record<string, string> = {};

        if (query.title) {
          conditions.push('p.title ILIKE :title');
          params.title = `%${query.title}%`;
        }
        if (query.shortDescription) {
          conditions.push('p.short_description ILIKE :shortDesc');
          params.shortDesc = `%${query.shortDescription}%`;
        }
        if (query.content) {
          conditions.push('p.content ILIKE :content');
          params.content = `%${query.content}%`;
        }
        if (query.blogName) {
          conditions.push('p.blog_name ILIKE :blogName');
          params.blogName = `%${query.blogName}%`;
        }

        qb.where(conditions.join(' OR '), params);
      });
    }

    queryBuilder.skip(query.calculateSkip()).take(query.pageSize);

    const sortFieldMap: Record<string, string> = {
      title: 'p.title COLLATE "C"',
      shortDescription: 'p.short_description COLLATE "C"',
      content: 'p.content COLLATE "C"',
      blogName: 'p.blog_name COLLATE "C"',
      createdAt: 'p.created_at',
    };

    const sortColumn = sortFieldMap[query.sortBy] ?? 'p.created_at';
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(sortColumn, sortDirection);

    const postsResult = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    const postIds = postsResult.map((c: any) => c.id);

    const likesInfo: Record<string, string> = {};

    if (postIds.length > 0) {
      if (userId) {
        const likes = await this.postLikesRepository.findByIds(postIds, userId);
        likes.forEach((l) => {
          likesInfo[l.postId] = l.myStatus;
        });
      }
    }

    const items = postsResult.map((postRaw: any) => {
      const myStatus = likesInfo[postRaw.id] || 'None';

      const mappedEntity = new Post();
      mappedEntity.id = postRaw.id;
      mappedEntity.title = postRaw.title;
      mappedEntity.shortDescription = postRaw.shortDescription;
      mappedEntity.content = postRaw.content;
      mappedEntity.blogId = postRaw.blogId;
      mappedEntity.blogName = postRaw.blogName;
      mappedEntity.createdAt = postRaw.createdAt;

      mappedEntity.extendedLikesInfo = {
        likesCount: postRaw.likesCount || 0,
        dislikesCount: postRaw.dislikesCount || 0,
        myStatus: myStatus,
        newestLikes: postRaw.newestLikes || [],
      };

      return PostViewDto.mapToView(mappedEntity, myStatus);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
