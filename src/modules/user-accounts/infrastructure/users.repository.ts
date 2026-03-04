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

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserMongo.name) private UserModel: UserMongoModelType,
    private dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserMongoDocument | null> {
    // return this.UserModel.findOne({
    //   _id: id,
    //   deletedAt: null,
    // });

    return this.dataSource.query(
      `SELECT * FROM users
                WHERE id = $1 and "deletedAt" IS NOT NULL `,
      [id],
    );
  }

  async create(user: User) {
    await this.dataSource.query(
      `
      INSERT INTO users (
        id, login, email, password_hash,
        "createdAt", "updatedAt", "deletedAt",
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
      `,
      [
        user.id,
        user.login,
        user.email,
        user.passwordHash,
        user.createdAt,
        user.updatedAt,
        user.deletedAt,
        user.emailConfirmationCode,
        user.emailIsConfirmed,
        user.emailConfirmationExpiration,
        user.recoveryCode,
        user.recoveryIsUsed,
        user.recoveryExpiration,
      ],
    );
  }

  async save(user: UserMongoDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserMongoDocument> {
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
  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserMongoDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
      deletedAt: null,
    });
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
         WHERE  ${fieldName} = $1`,
      [fieldValue],
    );
    if (user.length === 0) return null;
    return user;
    // return this.UserModel.findOne({ [fieldName]: fieldValue, deletedAt: null });
  }

  async findByCodeOrError(code: string): Promise<UserMongoDocument> {
    console.log('findByCode: ', code);
    const resultUser = await this.UserModel.findOne({
      'confirmationEmail.confirmationCode': code,
    });
    if (!resultUser) {
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
    return resultUser;
  }
  async findByRecoveryCodeOrError(code: string): Promise<UserMongoDocument> {
    console.log('findByCode: ', code);
    const resultUser = await this.UserModel.findOne({
      'passwordRecovery.confirmationCode': code,
    });
    if (!resultUser) {
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
    return resultUser;
  }
  async findByEmail(email: string): Promise<UserMongoDocument | null> {
    return this.UserModel.findOne({ email: email });
  }
}
