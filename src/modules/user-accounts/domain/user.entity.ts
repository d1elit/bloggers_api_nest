import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { Comment } from '../../bloggers-platform/comments/domain/comment.entity';
import { PostLike } from '../../bloggers-platform/posts/domain/post-like.entity';

export class EmailConfirmation {
  @Column({ name: 'email_confirmation_code', nullable: true, type: 'uuid' })
  emailConfirmationCode: string;

  @Column({ name: 'email_is_confirmed', default: false, type: 'boolean' })
  emailIsConfirmed: boolean;

  @Column({
    name: 'email_confirmation_expiration',
    nullable: true,
    type: 'timestamp without time zone',
  })
  emailConfirmationExpiration: Date;
}

export class PasswordRecovery {
  @Column({ type: 'uuid', nullable: true, name: 'recovery_code' })
  public recoveryCode: string;

  @Column({ type: 'boolean', name: 'recovery_is_used', nullable: true })
  public recoveryIsUsed: boolean;

  @Column({
    type: 'timestamp without time zone',
    name: 'recovery_expiration',
    nullable: true,
  })
  public recoveryExpiration: Date;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  //test
  @Column({ type: 'varchar', length: 10, collation: 'C', nullable: true })
  public name: string;

  @Column({ type: 'varchar', length: 10, collation: 'C' })
  public login: string;

  @Column({ type: 'varchar', length: 255, collation: 'C' })
  public email: string;

  @Column({ name: 'password_hash' })
  public passwordHash: string;

  @DeleteDateColumn({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: Date | null;

  @Column({ type: 'timestamp without time zone', name: 'created_at' })
  public createdAt: Date;

  @Column({ type: 'timestamp without time zone', name: 'updated_at' })
  public updatedAt: Date;

  @Column(() => EmailConfirmation, { prefix: false })
  confirmationEmail: EmailConfirmation;

  @Column(() => PasswordRecovery, { prefix: false })
  passwordRecovery: PasswordRecovery;

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user, { cascade: true })
  postLikes: PostLike[];

  static createInstance(dto: {
    login: string;
    email: string;
    passwordHash: string;
    confirmationCode?: string;
  }): User {
    const user = new User();

    user.id = randomUUID();
    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    // Инициализируем вложенный объект подтверждения email
    user.confirmationEmail = new EmailConfirmation();
    user.confirmationEmail.emailConfirmationCode =
      dto.confirmationCode || randomUUID();
    user.confirmationEmail.emailIsConfirmed = false;
    user.confirmationEmail.emailConfirmationExpiration = add(new Date(), {
      hours: 1,
      minutes: 3,
    });

    // Инициализируем вложенный объект восстановления пароля
    user.passwordRecovery = new PasswordRecovery();
    user.passwordRecovery.recoveryCode = randomUUID();
    user.passwordRecovery.recoveryIsUsed = false;
    user.passwordRecovery.recoveryExpiration = add(new Date(), { hours: 1 });

    // Даты createdAt и updatedAt TypeORM проставит сам благодаря @CreateDateColumn
    return user;
  }

  public softDelete(): void {
    console.log('IN SOFT DELETE ENTITY');
    if (this.deletedAt) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
  confirmEmail(): void {
    this.confirmationEmail.emailIsConfirmed = true;
  }

  isEmailConfirmed(): boolean {
    return this.confirmationEmail.emailIsConfirmed;
  }

  isEmailConfirmationExpired(): boolean {
    return (
      new Date() > new Date(this.confirmationEmail.emailConfirmationExpiration)
    );
  }

  updateEmailConfirmationCode(newCode: string): void {
    this.confirmationEmail.emailConfirmationCode = newCode;
    this.confirmationEmail.emailConfirmationExpiration = add(new Date(), {
      hours: 1,
      minutes: 3,
    });
  }

  canConfirmEmail(code: string): { isValid: boolean; error?: string } {
    if (this.isEmailConfirmed()) {
      return { isValid: false, error: 'Email already confirmed' };
    }
    if (code !== this.confirmationEmail.emailConfirmationCode) {
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
      // this.passwordRecovery = {};
    }
    this.passwordRecovery.recoveryCode = newCode;
    this.passwordRecovery.recoveryIsUsed = false;
    this.passwordRecovery.recoveryExpiration = add(new Date(), {
      hours: 1,
    });
  }

  isPasswordRecoveryExpired(): boolean {
    if (!this.passwordRecovery?.recoveryExpiration) return true;
    return new Date() > new Date(this.passwordRecovery.recoveryExpiration);
  }

  canRecoverPassword(code: string): { isValid: boolean; error?: string } {
    if (!this.passwordRecovery) {
      return { isValid: false, error: 'Recovery not initiated' };
    }
    if (this.passwordRecovery.recoveryIsUsed) {
      return { isValid: false, error: 'Recovery code already used' };
    }
    if (code !== this.passwordRecovery.recoveryCode) {
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
      this.passwordRecovery.recoveryIsUsed = true;
    }
  }
}
