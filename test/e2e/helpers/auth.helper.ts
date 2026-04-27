import { INestApplication } from '@nestjs/common';
import request from 'supertest';

const defaultUser = {
  login: 'user1',
  email: 'user1@mail.com',
  password: 'qwerty123',
};

export class AuthHelper {
  constructor(private readonly app: INestApplication) {}

  async register(data = {}): Promise<request.Response> {
    return request(this.app.getHttpServer())
      .post('/auth/registration')
      .send({ ...defaultUser, ...data })
      .expect(204);
  }

  async login(data = {}): Promise<string> {
    const res = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: defaultUser.login,
        password: defaultUser.password,
        ...data,
      })
      .expect(200);

    return res.body.accessToken;
  }

  async createUserAndLogin(): Promise<string> {
    const random = Math.random().toString(36).substring(2, 10);
    console.log(random);
    const user = {
      login: `us${random}`,
      email: `user${random}@mail.com`,
      password: 'qwerty123',
    };
    await this.register(user);
    return this.login({ loginOrEmail: user.login, password: user.password });
  }
}
