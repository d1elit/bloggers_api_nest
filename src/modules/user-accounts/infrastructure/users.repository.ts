import { InjectModel } from '@nestjs/mongoose';
import {
  UserMongo,
  UserMongoDocument,
  type UserMongoModelType,
} from '../domain/user-mongo.entity';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User } from '../domain/user.entity';
import { DataSource } from 'typeorm';
import { UsersMapper } from './users-mapper';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserMongo.name) private UserModel: UserMongoModelType,
    private dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<User | null> {
    console.log('IM IN FIND', [id]);
    const raw = await this.dataSource.query(
      `SELECT * FROM users
                WHERE id = $1 and "deleted_at" IS NULL `,
      [id],
    );
    console.log(raw);
    return UsersMapper.toDomain(raw[0]);
  }

  async saveMongo(user: UserMongoDocument) {
    await user.save();
  }

  async save(domainUser: User) {
    const user = UsersMapper.toPersistence(domainUser);
    await this.dataSource.query(
      `
        INSERT INTO users (
          id, login, email, password_hash,
          created_at, updated_at, deleted_at,
          email_confirmation_code,
          email_is_confirmed,
          email_confirmation_expiration,
          recovery_code,
          recovery_is_used,
          recovery_expiration
        )
        VALUES (
                 $1,$2,$3,$4,
                 $5,$6,$7,
                 $8,$9,$10,
                 $11,$12,$13
               )
          ON CONFLICT (id)
    DO UPDATE SET
          login = EXCLUDED.login,
                   email = EXCLUDED.email,
                   password_hash = EXCLUDED.password_hash,
                   updated_at = EXCLUDED.updated_at,
                   deleted_at = EXCLUDED.deleted_at,
                   email_confirmation_code = EXCLUDED.email_confirmation_code,
                   email_is_confirmed = EXCLUDED.email_is_confirmed,
                   email_confirmation_expiration = EXCLUDED.email_confirmation_expiration,
                   recovery_code = EXCLUDED.recovery_code,
                   recovery_is_used = EXCLUDED.recovery_is_used,
                   recovery_expiration = EXCLUDED.recovery_expiration
      `,
      [
        user.id,
        user.login,
        user.email,
        user.password_hash,
        user.created_at,
        user.updated_at,
        user.deleted_at,
        user.email_confirmation_code,
        user.email_is_confirmed,
        user.email_confirmation_expiration,
        user.recovery_code,
        user.recovery_is_used,
        user.recovery_expiration,
      ],
    );
    return user;
  }

  async findOrNotFoundFail(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'User not found',
          },
        ],
      });
    }

    return user;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    // return this.UserModel.findOne({
    //   $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    //   deletedAt: null,
    // });
    const row = await this.dataSource.query(
      `Select * from users 
        WHERE email = $1 or login = $1`,
      [loginOrEmail],
    );
    return UsersMapper.toDomain(row[0]);
  }

  async findFieldWithValue(
    fieldName: string,
    fieldValue: string,
  ): Promise<UserMongoDocument | null> {
    const allowedFields = ['login', 'email'];
    if (!allowedFields.includes(fieldName)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: fieldName,
            message: 'Field not exists',
          },
        ],
      });
    }
    const user = await this.dataSource.query(
      `SELECT * from users 
         WHERE  ${fieldName} = $1 and deleted_at is not null `,
      [fieldValue],
    );
    if (user.length === 0) return null;
    return user;
    // return this.UserModel.findOne({ [fieldName]: fieldValue, deletedAt: null });
  }

  async findByCodeOrError(code: string): Promise<User> {
    console.log('findByCode: ', code);
    // const resultUser = await this.UserModel.findOne({
    //   'confirmationEmail.confirmationCode': code,
    // });
    const result = await this.dataSource.query(
      `SELECT * FROM USERS WHERE email_confirmation_code = $1`,
      [code],
    );
    console.log(result);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            field: 'code',
            message: 'Code not exist',
          },
        ],
      });
    }
    return UsersMapper.toDomain(result[0]);
  }
  async findByRecoveryCodeOrError(code: string): Promise<User> {
    console.log('findByCode: ', code);
    // const result = await this.UserModel.findOne({
    //   'passwordRecovery.confirmationCode': code,
    // });
    const result = await this.dataSource.query(
      `
    SELECT * FROM USERS WHERE recovery_code = $1`,
      [code],
    );

    if (result[0].lenght === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'user',
            message: 'User not found',
          },
        ],
      });
    }

    return UsersMapper.toDomain(result[0]);
  }
  async findByEmail(email: string): Promise<User | null> {
    // return this.UserModel.findOne({ email: email });
    const result = await this.dataSource.query(
      `SELECT * FROM USERS WHERE email = $1`,
      [email],
    );
    return UsersMapper.toDomain(result[0]);
  }
}
