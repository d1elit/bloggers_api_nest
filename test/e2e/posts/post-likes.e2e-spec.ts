import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { BlogHelper } from '../helpers/blogs.helper';
import { AuthHelper } from '../helpers/auth.helper';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSetup } from '../../../src/setup/app.setup';
import request from 'supertest';

describe('Posts (e2e) public', () => {
  let app: INestApplication<App>;
  let blogHelper: BlogHelper;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();
    blogHelper = new BlogHelper(app);
    authHelper = new AuthHelper(app);
  });

  afterAll(async () => await app.close());

  beforeEach(async () => {
    await request(app.getHttpServer()).delete('/testing/all-data').expect(204);
  });

  // Хелпер чтобы не дублировать PUT /like-status
  const setLikeStatus = (
    app: INestApplication,
    postId: string,
    token: string,
    likeStatus: 'Like' | 'Dislike' | 'None',
  ) =>
    request(app.getHttpServer())
      .put(`/posts/${postId}/like-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ likeStatus })
      .expect(204);

  const getPost = (app: INestApplication, postId: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/posts/${postId}`);
    if (token) req.set('Authorization', `Bearer ${token}`);
    return req.expect(200);
  };

  describe('Posts likes', () => {
    it('should like post and get liked status on post', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await setLikeStatus(app, post.id, token, 'Like');

      const { body } = await getPost(app, post.id, token);

      expect(body).toEqual({
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: blog.id,
        blogName: blog.name,
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [
            {
              addedAt: expect.any(String),
              login: expect.any(String),
              userId: expect.any(String),
            },
          ],
        },
      });
    });

    it('should change Like to Dislike: likesCount=0, dislikesCount=1, newestLikes=[]', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await setLikeStatus(app, post.id, token, 'Like');

      // Промежуточная проверка: лайк реально выставился
      const { body: afterLike } = await getPost(app, post.id, token);
      expect(afterLike.extendedLikesInfo.likesCount).toBe(1);

      await setLikeStatus(app, post.id, token, 'Dislike');

      const { body } = await getPost(app, post.id, token);
      expect(body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 1,
        myStatus: 'Dislike',
        newestLikes: [],
      });
    });

    it('should change Like to None: all counters=0, myStatus=None, newestLikes=[]', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await setLikeStatus(app, post.id, token, 'Like');

      const { body: afterLike } = await getPost(app, post.id, token);
      expect(afterLike.extendedLikesInfo.likesCount).toBe(1);

      await setLikeStatus(app, post.id, token, 'None');

      const { body } = await getPost(app, post.id, token);
      expect(body.extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      });
    });

    it('should change Dislike to Like: dislikesCount=0, likesCount=1, newestLikes has entry', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await setLikeStatus(app, post.id, token, 'Dislike');

      const { body: afterDislike } = await getPost(app, post.id, token);
      expect(afterDislike.extendedLikesInfo.dislikesCount).toBe(1);

      await setLikeStatus(app, post.id, token, 'Like');

      const { body } = await getPost(app, post.id, token);
      expect(body.extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'Like',
        newestLikes: [
          {
            addedAt: expect.any(String),
            login: expect.any(String),
            userId: expect.any(String),
          },
        ],
      });
    });

    it('should return myStatus=None for unauthorized user even if post has likes', async () => {
      const token = await authHelper.createUserAndLogin();
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      await setLikeStatus(app, post.id, token, 'Like');

      // Запрос без токена
      const { body } = await getPost(app, post.id);
      expect(body.extendedLikesInfo.myStatus).toBe('None');
      // Лайки при этом видны
      expect(body.extendedLikesInfo.likesCount).toBe(1);
    });

    it('should show 3 newest likes in correct order (most recent first)', async () => {
      const { body: blog } = await blogHelper.createBlog();
      const { body: post } = await blogHelper.createPostForBlog(blog.id);

      // Создаём 4 юзеров и лайкаем по очереди
      const token1 = await authHelper.createUserAndLogin();
      await setLikeStatus(app, post.id, token1, 'Like');

      const token2 = await authHelper.createUserAndLogin();
      await setLikeStatus(app, post.id, token2, 'Like');

      const token3 = await authHelper.createUserAndLogin();
      await setLikeStatus(app, post.id, token3, 'Like');

      const token4 = await authHelper.createUserAndLogin();
      await setLikeStatus(app, post.id, token4, 'Like');

      const { body } = await getPost(app, post.id);

      const { extendedLikesInfo } = body;

      // Всего 4 лайка, но в newestLikes только 3
      expect(extendedLikesInfo.likesCount).toBe(4);
      expect(extendedLikesInfo.newestLikes).toHaveLength(3);

      // Каждый элемент имеет нужную форму
      for (const like of extendedLikesInfo.newestLikes) {
        expect(like).toEqual({
          addedAt: expect.any(String),
          login: expect.any(String),
          userId: expect.any(String),
        });
      }

      // Порядок: самый новый лайк идёт первым
      const dates = extendedLikesInfo.newestLikes.map(
        (l: { addedAt: string }) => new Date(l.addedAt).getTime(),
      );
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
      expect(dates[1]).toBeGreaterThanOrEqual(dates[2]);

      // Первый лайкнувший (token1) не должен попасть в newestLikes
      // так как он самый старый из четырёх
      // Проверяем что userId первого юзера отсутствует в списке
      // (нужен доступ к userId — получаем через /auth/me)
      const { body: me1 } = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const ids = extendedLikesInfo.newestLikes.map(
        (l: { userId: string }) => l.userId,
      );
      expect(ids).not.toContain(me1.userId);
    });
  });
});
