import { INestApplication } from '@nestjs/common';
import { CommentInputDto } from '../../../src/modules/bloggers-platform/comments/api/input-dto/comment.input-dto';
import { BlogHelper } from './blogs.helper';
import request from 'supertest';
import { AuthHelper } from './auth.helper';

const deafultCommentData: CommentInputDto = {
  content: 'Anton Chigurh didn t kill anyone',
};

export class PostsHelper {
  private blogHelper: BlogHelper;
  private authHelper: AuthHelper;

  constructor(private readonly app: INestApplication) {
    this.blogHelper = new BlogHelper(app); // ✅
    this.authHelper = new AuthHelper(app);
  }

  async createComment(
    postId: string,
    data: Partial<CommentInputDto> = {},
    expectedStatus = 201,
  ): Promise<request.Response> {
    const token = await this.authHelper.createUserAndLogin();
    return request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)

      .set('Authorization', `Bearer ${token}`) // 🔥 вот ключ
      .send({ ...deafultCommentData, ...data })
      .expect(expectedStatus);
  }

  async createCommentWithPost(
    data: Partial<CommentInputDto> = {},
    expectedStatus = 201,
  ): Promise<request.Response> {
    const { body: blog } = await this.blogHelper.createBlog();
    const { body: post } = await this.blogHelper.createPostForBlog(blog.id);
    const token = await this.authHelper.createUserAndLogin();
    return request(this.app.getHttpServer())
      .post(`/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${token}`) // 🔥 вот ключ
      .send({ ...deafultCommentData, ...data })
      .expect(expectedStatus);
  }
}
