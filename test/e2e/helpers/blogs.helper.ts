// test/helpers/blog.helper.ts
import { INestApplication } from '@nestjs/common';
import { CreateBlogDto } from '../../../src/modules/bloggers-platform/blogs/dto/create-blog.dto';
import request from 'supertest';

const defaultBlogData: CreateBlogDto = {
  name: 'Test Blog',
  description: 'A test blog description',
  websiteUrl: 'https://test-blog.com',
};

const defaultPostData = {
  title: 'Test Post',
  shortDescription: 'Short description',
  content: 'Long content of the post',
};

const adminAuth = Buffer.from('admin:qwerty').toString('base64');

export class BlogHelper {
  constructor(private readonly app: INestApplication) {}

  async createBlog(
    data: Partial<CreateBlogDto> = {},
    expectedStatus = 201,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/sa/blogs')
      .set('Authorization', `Basic ${adminAuth}`)
      .send({ ...defaultBlogData, ...data })
      .expect(expectedStatus);
  }

  async createPostForBlog(
    blogId: string,
    data: Partial<typeof defaultPostData> = {},
    expectedStatus = 201,
  ): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .set('Authorization', `Basic ${adminAuth}`)
      .send({ ...defaultPostData, ...data })
      .expect(expectedStatus);
  }

  async createManyBlogs(count: number): Promise<request.Response[]> {
    return Promise.all(
      Array.from({ length: count }, (_, i) =>
        this.createBlog({ name: `Blog ${i + 1}` }),
      ),
    );
  }
}
