import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';

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

  @Column({ type: 'varchar', length: 10 })
  public login: string;

  @Column({ type: 'varchar', length: 255 })
  public email: string;

  @Column({ name: 'password_hash' })
  public passwordHash: string;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
    name: 'deleted_at',
  })
  public deletedAt: string | null;

  @Column({ type: 'timestamp without time zone', name: 'created_at' })
  public createdAt: Date;

  @Column({ type: 'timestamp without time zone', name: 'updated_at' })
  public updatedAt: Date;

  @Column(() => EmailConfirmation, { prefix: false })
  confirmationEmail: EmailConfirmation;

  @Column(() => PasswordRecovery, { prefix: false })
  passwordRecovery: PasswordRecovery;

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
}
