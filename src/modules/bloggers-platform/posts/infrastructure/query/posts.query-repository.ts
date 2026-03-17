import { Injectable } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PostLikesRepository } from '../post-likes.repository';
import { DataSource } from 'typeorm';

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
  ) {}

  async getByIdOrNotFoundFail(id: string, likeStatus?: string) {
    const raw = await this.dataSource.query(
      `SELECT * FROM posts WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (!raw[0]) {
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
    console.log('NEWET LIEKS');

    const newestLikes: NewestLikeView[] = newestLikesRaw.map((like: any) => ({
      addedAt: like.addedAt.toISOString(),
      userId: like.userId,
      login: like.userLogin,
    }));
    console.log(newestLikes);

    return PostViewDto.mapToView(raw[0], likeStatus, newestLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const values: any[] = [];
    let where = `WHERE deleted_at IS NULL`;

    if (blogId) {
      values.push(blogId);
      where += ` AND blog_id = $${values.length}`;
    }

    if (
      query.title ||
      query.shortDescription ||
      query.content ||
      query.blogName
    ) {
      where += ` AND (`;
      const conditions: string[] = [];

      if (query.title) {
        values.push(`%${query.title}%`);
        conditions.push(`title ILIKE $${values.length}`);
      }

      if (query.shortDescription) {
        values.push(`%${query.shortDescription}%`);
        conditions.push(`short_description ILIKE $${values.length}`);
      }

      if (query.content) {
        values.push(`%${query.content}%`);
        conditions.push(`content ILIKE $${values.length}`);
      }

      if (query.blogName) {
        values.push(`%${query.blogName}%`);
        conditions.push(`blog_name ILIKE $${values.length}`);
      }

      where += conditions.join(` OR `) + `)`;
    }

    const whereParamsCount = values.length;

    // Mapping sorting
    const sortMap: Record<string, string> = {
      title: `title COLLATE "C"`,
      shortDescription: `short_description COLLATE "C"`,
      content: `content COLLATE "C"`,
      blogName: `blog_name COLLATE "C"`,
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
      SELECT
        id, title, short_description, content,
        blog_id, blog_name, created_at, deleted_at,
        likes_count, dislikes_count
      FROM posts
      ${where}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM posts ${where}
    `;

    const postsResult = await this.dataSource.query(dataQuery, values);
    const countResult = await this.dataSource.query(
      countQuery,
      values.slice(0, whereParamsCount),
    );

    const totalCount = Number(countResult[0].count);
    const postIds = postsResult.map((c: any) => c.id);

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

      // Группируем лайки по post_id
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

    // Собираем итоговые DTO
    const items = postsResult.map((post: any) => {
      const myStatus = likesInfo[post.id] || 'None';
      const newestLikes = newestLikesInfo[post.id] || [];

      // Передаем newestLikes в mapToView
      return PostViewDto.mapToView(post, myStatus, newestLikes);
    });

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
