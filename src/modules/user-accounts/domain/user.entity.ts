import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { add } from 'date-fns';

@Schema({ _id: false })
export class ConfirmationEmail {
  @Prop({ type: String, required: true })
  confirmationCode: string;

  @Prop({ type: Boolean, required: true, default: false })
  isConfirmed: boolean;

  @Prop({ type: String, required: true })
  expirationDate: string;
}

export const ConfirmationEmailSchema =
  SchemaFactory.createForClass(ConfirmationEmail);

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({ type: String, required: false })
  confirmationCode?: string;

  @Prop({ type: Boolean, required: false, default: false })
  isUsed?: boolean;

  @Prop({ type: String, required: false })
  expirationDate?: string;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);

/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
  /**
   * Login of the user (must be unique)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, unique: true })
  login: string;

  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  passwordHash: string;

  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, unique: true })
  email: string;

  /**
   * Email confirmation data
   * @type {ConfirmationEmail}
   */
  @Prop({ type: ConfirmationEmailSchema, required: true })
  confirmationEmail: {
    confirmationCode: string;
    isConfirmed: boolean;
    expirationDate: string;
  };

  /**
   * Password recovery data
   * @type {PasswordRecovery}
   */
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery?: {
    confirmationCode?: string;
    isUsed?: boolean;
    expirationDate?: string;
  };

  /**
   * Creation timestamp
   * Automatically added by timestamps: true
   * @type {Date}
   */
  createdAt: Date;

  /**
   * Update timestamp
   * Automatically added by timestamps: true
   * @type {Date}
   */
  updatedAt: Date;

  /**
   * Deletion timestamp, nullable, if date exists, means entity is soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  get id(): string {
    // @ts-ignore
    return this._id.toString();
  }

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    const confirmationCode = dto.confirmationCode || crypto.randomUUID();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = null;
    user.confirmationEmail = {
      confirmationCode: confirmationCode,
      isConfirmed: false,
      expirationDate: add(new Date(), {
        hours: 1,
        minutes: 3,
      }).toISOString(),
    };
    user.passwordRecovery = {
      confirmationCode: crypto.randomUUID(),
      isUsed: false,
      expirationDate: add(new Date(), {
        hours: 1,
      }).toISOString(),
    };

    return user as UserDocument;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  // update(dto: UpdateUserDto): void {
  //   if (dto.email && dto.email !== this.email) {
  //     this.email = dto.email;
  //     // Сбрасываем подтверждение email при изменении
  //     this.confirmationEmail.isConfirmed = false;
  //     this.confirmationEmail.confirmationCode = crypto.randomUUID();
  //     this.confirmationEmail.expirationDate = add(new Date(), {
  //       hours: 1,
  //       minutes: 3,
  //     }).toISOString();
  //   }
  //
  //   if (dto.login) {
  //     this.login = dto.login;
  //   }
  // }

  // ============= Email Confirmation Methods =============

  confirmEmail(): void {
    this.confirmationEmail.isConfirmed = true;
  }

  isEmailConfirmed(): boolean {
    return this.confirmationEmail.isConfirmed;
  }

  isEmailConfirmationExpired(): boolean {
    return new Date() > new Date(this.confirmationEmail.expirationDate);
  }

  updateEmailConfirmationCode(newCode: string): void {
    this.confirmationEmail.confirmationCode = newCode;
    this.confirmationEmail.expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();
  }

  canConfirmEmail(code: string): { isValid: boolean; error?: string } {
    if (this.isEmailConfirmed()) {
      return { isValid: false, error: 'Email already confirmed' };
    }
    if (code !== this.confirmationEmail.confirmationCode) {
      return { isValid: false, error: 'Wrong confirmation code' };
    }
    if (this.isEmailConfirmationExpired()) {
      return { isValid: false, error: 'Confirmation code expired' };
    }
    return { isValid: true };
  }

  // ============= Password Recovery Methods =============

  updatePasswordRecoveryCode(newCode: string): void {
    if (!this.passwordRecovery) {
      this.passwordRecovery = {};
    }
    this.passwordRecovery.confirmationCode = newCode;
    this.passwordRecovery.isUsed = false;
    this.passwordRecovery.expirationDate = add(new Date(), {
      hours: 1,
    }).toISOString();
  }

  isPasswordRecoveryExpired(): boolean {
    if (!this.passwordRecovery?.expirationDate) return true;
    return new Date() > new Date(this.passwordRecovery.expirationDate);
  }

  canRecoverPassword(code: string): { isValid: boolean; error?: string } {
    if (!this.passwordRecovery) {
      return { isValid: false, error: 'Recovery not initiated' };
    }
    if (this.passwordRecovery.isUsed) {
      return { isValid: false, error: 'Recovery code already used' };
    }
    if (code !== this.passwordRecovery.confirmationCode) {
      return { isValid: false, error: 'Wrong recovery code' };
    }
    if (this.isPasswordRecoveryExpired()) {
      return { isValid: false, error: 'Recovery code expired' };
    }
    return { isValid: true };
  }

  updatePassword(hashedPassword: string): void {
    this.passwordHash = hashedPassword;
    if (this.passwordRecovery) {
      this.passwordRecovery.isUsed = true;
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
