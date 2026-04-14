import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { BlogHelper } from '../helpers/blogs.helper';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSetup } from '../../../src/setup/app.setup';
import request from 'supertest';

const adminAuth = Buffer.from('admin:qwerty').toString('base64');

describe('SA Blogs (e2e)', () => {
  let app: INestApplication<App>;
  let blogHelper: BlogHelper;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
    blogHelper = new BlogHelper(app);
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  describe('SA Blogs Controller (/sa/blogs)', () => {
    it('should create a blog with correct basic auth', async () => {
      const response = await blogHelper.createBlog();

      expect(response.body).toEqual({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: false,
      });
    });

    it('should NOT create a blog with unauthorized basic auth', async () => {
      await request(app.getHttpServer())
        .post('/sa/blogs')
        .set('Authorization', `Basic incorrect`)
        .send({})
        .expect(401);
    });

    it('should validate blog creation payload', async () => {
      const res = await blogHelper.createBlog(
        {
          name: '',
          description: 'a'.repeat(501),
          websiteUrl: 'invalid-url',
        },
        400,
      );

      expect(res.body.errorsMessages).toHaveLength(3);
      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'description' }),
          expect.objectContaining({ field: 'websiteUrl' }),
        ]),
      );
    });

    it('should update an existing blog', async () => {
      const { body: blog } = await blogHelper.createBlog();

      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        websiteUrl: 'https://updated-blog.com',
      };

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .send(updateData)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/sa/blogs/${blog.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .expect(200);

      expect(res.body.name).toBe(updateData.name);
      expect(res.body.websiteUrl).toBe(updateData.websiteUrl);
    });

    it('should delete an existing blog', async () => {
      const { body: blog } = await blogHelper.createBlog();

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blog.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/sa/blogs/${blog.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .expect(404);
    });

    it('should get blogs list with pagination', async () => {
      await blogHelper.createManyBlogs(3);

      const res = await request(app.getHttpServer())
        .get('/sa/blogs')
        .query({ pageSize: 2, sortDirection: 'asc' })
        .set('Authorization', `Basic ${adminAuth}`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.totalCount).toBe(3);
      expect(res.body.pagesCount).toBe(2);
    });

    it('should create a post for a blog', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const response = await blogHelper.createPostForBlog(blog.id);

      expect(response.body).toEqual({
        id: expect.any(String),
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

    it('should update a post for a blog', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/posts/${post.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .send({
          title: 'Updated Post Title',
          shortDescription: 'Updated short desc',
          content: 'Updated content',
        })
        .expect(204);
    });

    it('should delete a post for a blog', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blog.id}/posts/${post.id}`)
        .set('Authorization', `Basic ${adminAuth}`)
        .expect(204);
    });
  });
});
