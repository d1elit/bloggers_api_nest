import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../domain/post.entity';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostViewDto> {
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

    return PostViewDto.mapToView(post);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const queryBuilder = this.postRepo.createQueryBuilder('p');

    queryBuilder.select([
      'p.id as id',
      'p.title as title',
      'p.short_description as "shortDescription"',
      'p.content as content',
      'p.blog_id as "blogId"',
      'p.blog_name as "blogName"',
      'p.created_at as "createdAt"',
      'p.likes_count as "likesCount"',
      'p.dislikes_count as "dislikesCount"',
      'p.newest_likes as "newestLikes"'
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
        let hasCondition = false;

        if (query.title) {
          qb.orWhere('p.title ILIKE :title', { title: `%${query.title}%` });
          hasCondition = true;
        }

        if (query.shortDescription) {
          const condition = 'p.short_description ILIKE :shortDesc';
          if (hasCondition) qb.orWhere(condition, { shortDesc: `%${query.shortDescription}%` });
          else qb.where(condition, { shortDesc: `%${query.shortDescription}%` });
          hasCondition = true;
        }

        if (query.content) {
          const condition = 'p.content ILIKE :content';
          if (hasCondition) qb.orWhere(condition, { content: `%${query.content}%` });
          else qb.where(condition, { content: `%${query.content}%` });
          hasCondition = true;
        }

        if (query.blogName) {
          const condition = 'p.blog_name ILIKE :blogName';
          if (hasCondition) qb.orWhere(condition, { blogName: `%${query.blogName}%` });
          else qb.where(condition, { blogName: `%${query.blogName}%` });
        }
      });
    }

    queryBuilder.skip(query.calculateSkip()).take(query.pageSize);

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // To handle mapping from DTO keys to database columns/aliases in OrderBy
    let orderByColumn = `p.${sortField}`;
    if (sortField === 'shortDescription') orderByColumn = 'p.short_description';
    if (sortField === 'blogName') orderByColumn = 'p.blog_name';
    if (sortField === 'createdAt') orderByColumn = 'p.created_at';

    queryBuilder.orderBy(orderByColumn, sortDirection);

    const itemsRaw = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    const items = itemsRaw.map((postRaw: any) => {
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
         myStatus: 'None',
         newestLikes: postRaw.newestLikes || []
      };

      return PostViewDto.mapToView(mappedEntity);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}