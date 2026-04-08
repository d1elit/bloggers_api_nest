import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikesRepository } from '../post-likes.repository';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/post.entity';

// Тип для маппинга последних лайков (можно вынести в отдельный файл)
export type NewestLikeView = {
  addedAt: string;
  userId: string;
  login: string;
};

@Injectable()
export class PostsQueryRepository {
  constructor(
    private dataSource: DataSource,
    private postLikesRepository: PostLikesRepository,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
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

    const newestLikesRaw = await this.dataSource.query(
      `
      SELECT added_at as "addedAt", user_id as "userId", user_login as "userLogin"
      FROM post_likes
      WHERE post_id = $1 AND my_status = 'Like'
      ORDER BY added_at DESC
      LIMIT 3
      `,
      [id],
    );

    const newestLikes: NewestLikeView[] = newestLikesRaw.map((like: any) => ({
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.userLogin,
    }));

    return PostViewDto.mapToView(post, likeStatus, newestLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const queryBuilder = this.postRepo.createQueryBuilder('p');

    // Selecting individual fields since we return raw entities for performance in pagination
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

    // Sorting
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

    // To prevent SQL injection in ORDER BY, we use explicit mapping and passing as literal
    queryBuilder.orderBy(sortColumn, sortDirection);

    const postsResultRaw = await queryBuilder.getRawMany();
    const totalCount = await queryBuilder.getCount();

    const postIds = postsResultRaw.map((c: any) => c.id);

    const likesInfo: Record<string, string> = {};
    const newestLikesInfo: Record<string, NewestLikeView[]> = {};

    if (postIds.length > 0) {
      if (userId) {
        const likes = await this.postLikesRepository.findByIds(postIds, userId);
        likes.forEach((l) => {
          likesInfo[l.postId] = l.myStatus;
        });
      }

      const newestLikesQuery = `
        SELECT post_id, added_at as "addedAt", user_id as "userId", user_login
        FROM (
          SELECT 
            post_id, 
            added_at, 
            user_id, 
            user_login,
            ROW_NUMBER() OVER(PARTITION BY post_id ORDER BY added_at DESC) as rn
          FROM post_likes
          WHERE post_id = ANY($1) AND my_status = 'Like'
        ) as ranked_likes
        WHERE rn <= 3
      `;

      const newestLikesRaw = await this.dataSource.query(newestLikesQuery, [
        postIds,
      ]);

      newestLikesRaw.forEach((like: any) => {
        if (!newestLikesInfo[like.post_id]) {
          newestLikesInfo[like.post_id] = [];
        }
        newestLikesInfo[like.post_id].push({
          addedAt: like.addedAt.toISOString(),
          userId: like.userId,
          login: like.user_login,
        });
      });
    }

    const items = postsResultRaw.map((postRaw: any) => {
      const myStatus = likesInfo[postRaw.id] || 'None';
      const newestLikes = newestLikesInfo[postRaw.id] || [];

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

      return PostViewDto.mapToView(mappedEntity, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
