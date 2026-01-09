import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, type UserModelType } from '../domain/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return user;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }
  async findFieldWithValue(
    fieldName: string,
    fieldValue: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ [fieldName]: fieldValue });
  }

  async findByCodeOrError(code: string): Promise<UserDocument> {
    console.log('findByCode: ', code);
    let resultUser = await this.UserModel.findOne({
      'confirmationEmail.confirmationCode': code,
    });
    if (!resultUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return resultUser;
  }
  async findByRecoveryCodeOrError(code: string): Promise<UserDocument> {
    console.log('findByCode: ', code);
    let resultUser = await this.UserModel.findOne({
      'passwordRecovery.confirmationCode': code,
    });
    if (!resultUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return resultUser;
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email: email });
  }
}
