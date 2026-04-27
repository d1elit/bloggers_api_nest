import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSetup } from '../../../src/setup/app.setup';
import request from 'supertest';
import { BlogHelper } from '../helpers/blogs.helper';
import { PostsHelper } from '../helpers/posts.helper';
import { CommentInputDto } from '../../../src/modules/bloggers-platform/comments/api/input-dto/comment.input-dto';
import { AuthHelper } from '../helpers/auth.helper';

describe('Posts (e2e) public', () => {
  let app: INestApplication<App>;
  let blogHelper: BlogHelper;
  let postHelper: PostsHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
    blogHelper = new BlogHelper(app);
    postHelper = new PostsHelper(app);
    authHelper = new AuthHelper(app);
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  // ─── Хелперы ────────────────────────────────────────────────────────────────

  const getPost = (postId: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/posts/${postId}`);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  };

  const getPostComments = (postId: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/posts/${postId}/comments`);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req;
  };

  // ─── GET /posts/:id ──────────────────────────────────────────────────────────

  describe('GET /posts/:id', () => {
    it('should return post by id with correct structure', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      const { body } = await getPost(post.id).expect(200);

      expect(body).toEqual({
        id: post.id,
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });

    // it('should return 404 for non-existing post', async () => {
    //   await getPost('507f1f77bcf86cd799439011').expect(404);
    // });

    it('should return myStatus=None for unauthorized request on post with likes', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      // Без токена — myStatus всегда None, но лайки видны
      const { body } = await getPost(post.id).expect(200);
      expect(body.extendedLikesInfo.myStatus).toBe('None');
      expect(body.extendedLikesInfo.likesCount).toBe(1);
    });
  });

  // ─── GET /blogs/:id/posts ────────────────────────────────────────────────────

  describe('GET /blogs/:blogId/posts', () => {
    it('should return all posts for blog', async () => {
      const { body: blog } = await blogHelper.createBlog();
      await blogHelper.createPostForBlog(blog.id);
      await blogHelper.createPostForBlog(blog.id, { title: 'Post 2' });
      await blogHelper.createPostForBlog(blog.id, { title: 'Post 3' });

      const { body } = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts`)
        .expect(200);

      expect(body.items).toHaveLength(3);
    });

    it('should return posts only for specified blog, not from another blog', async () => {
      const { body: blog1 } = await blogHelper.createBlog();
      const { body: blog2 } = await blogHelper.createBlog();

      await blogHelper.createPostForBlog(blog1.id);
      await blogHelper.createPostForBlog(blog1.id, { title: 'Post 2' });
      await blogHelper.createPostForBlog(blog2.id);

      const { body } = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}/posts`)
        .expect(200);

      expect(body.items).toHaveLength(2);
      body.items.forEach((post: { blogId: string }) => {
        expect(post.blogId).toBe(blog1.id);
      });
    });

    it('should return correct pagination metadata', async () => {
      const { body: blog } = await blogHelper.createBlog();
      for (let i = 1; i <= 5; i++) {
        await blogHelper.createPostForBlog(blog.id, { title: `Post ${i}` });
      }

      const { body } = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts?pageSize=2&pageNumber=1`)
        .expect(200);

      expect(body).toMatchObject({
        page: 1,
        pageSize: 2,
        totalCount: 5,
        pagesCount: 3,
      });
      expect(body.items).toHaveLength(2);
    });

    it('should return second page correctly', async () => {
      const { body: blog } = await blogHelper.createBlog();
      for (let i = 1; i <= 5; i++) {
        await blogHelper.createPostForBlog(blog.id, { title: `Post ${i}` });
      }

      const { body } = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts?pageSize=2&pageNumber=2`)
        .expect(200);

      expect(body.items).toHaveLength(2);
      expect(body.page).toBe(2);
    });

    it('should return empty items for page beyond total', async () => {
      const { body: blog } = await blogHelper.createBlog();
      await blogHelper.createPostForBlog(blog.id);

      const { body } = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts?pageSize=10&pageNumber=99`)
        .expect(200);

      expect(body.items).toHaveLength(0);
    });

    // it('should return 404 for non-existing blog', async () => {
    //   await request(app.getHttpServer())
    //     .get('/blogs/507f1f77bcf86cd799439011/posts')
    //     .expect(404);
    // });
  });

  // ─── POST /posts/:id/comments ────────────────────────────────────────────────

  describe('POST /posts/:id/comments', () => {
    it('should create comment and it should appear in comments list', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);
      const contentData: CommentInputDto = {
        content: 'tests11111111111111111111',
      };

      const { body: comment } = await postHelper.createComment(
        post.id,
        contentData,
      );

      expect(comment).toEqual({
        id: expect.any(String),
        content: contentData.content,
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.any(String),
        likesInfo: {
          dislikesCount: 0,
          likesCount: 0,
          myStatus: 'None',
        },
      });

      const { body: comments } = await getPostComments(post.id).expect(200);
      expect(comments.items).toHaveLength(1);
      expect(comments.items[0].id).toBe(comment.id);
    });

    it('should return 401 when creating comment without authorization', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .send({ content: 'unauthorized comment attempt' })
        .expect(401);
    });

    it('should return 400 when content is too short', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await postHelper.createComment(post.id, { content: 'short' }, 400);
    });

    // it('should return 404 when post does not exist', async () => {
    //   await postHelper.createComment(
    //     '507f1f77bcf86cd799439011',
    //     { content: 'valid content 111111111111111' },
    //     404,
    //   );
    // });
  });

  // ─── GET /posts/:id/comments ─────────────────────────────────────────────────

  describe('GET /posts/:id/comments', () => {
    it('should return all comments for post', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await postHelper.createComment(post.id, {
        content: 'testsdata111111111111',
      });
      await postHelper.createComment(post.id, {
        content: 'testsdata222222222222',
      });
      await postHelper.createComment(post.id, {
        content: 'testsdata333333333333',
      });

      const { body } = await getPostComments(post.id).expect(200);
      expect(body.items).toHaveLength(3);
    });

    it('should return myStatus=Like in comment for authorized user who liked it', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);
      const { body: comment } = await postHelper.createComment(post.id, {
        content: 'testsdata111111111111',
      });

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      const { body } = await getPostComments(post.id, token).expect(200);
      expect(body.items[0].likesInfo.myStatus).toBe('Like');
      expect(body.items[0].likesInfo.likesCount).toBe(1);
    });

    it('should return myStatus=None for unauthorized user on comments with likes', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);
      const { body: comment } = await postHelper.createComment(post.id, {
        content: 'testsdata111111111111',
      });

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ likeStatus: 'Like' })
        .expect(204);

      // Без токена
      const { body } = await getPostComments(post.id).expect(200);
      expect(body.items[0].likesInfo.myStatus).toBe('None');
      expect(body.items[0].likesInfo.likesCount).toBe(1);
    });

    // it('should return 404 for comments of non-existing post', async () => {
    //   await getPostComments('507f1f77bcf86cd799439011').expect(404);
    // });

    it('should return correct pagination for comments', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      for (let i = 1; i <= 5; i++) {
        await postHelper.createComment(post.id, {
          content: `comment content ${i}`.padEnd(20, '!'),
        });
      }

      const { body } = await getPostComments(post.id)
        .query({ pageSize: 2, pageNumber: 1 })
        .expect(200);

      expect(body).toMatchObject({
        page: 1,
        pageSize: 2,
        totalCount: 5,
        pagesCount: 3,
      });
      expect(body.items).toHaveLength(2);
    });
  });
});
