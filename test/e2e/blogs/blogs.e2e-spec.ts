import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { BlogHelper } from '../helpers/blogs.helper';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSetup } from '../../../src/setup/app.setup';
import request from 'supertest';

describe('Blogs (e2e) public', () => {
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

  // validBlogData и validPostData больше не нужны — они в хелпере

  describe('Public Blogs Controller (/blogs)', () => {
    it('should get a blog by id publicly', async () => {
      const { body: blog } = await blogHelper.createBlog();

      const res = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200);

      expect(res.body.id).toBe(blog.id);
    });

    it('should get posts for a specific blog publicly', async () => {
      const { body: blog } = await blogHelper.createBlog();
      await blogHelper.createPostForBlog(blog.id);
      await blogHelper.createPostForBlog(blog.id, { title: 'Post 2' });

      const res = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}/posts`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
    });
  });
});
