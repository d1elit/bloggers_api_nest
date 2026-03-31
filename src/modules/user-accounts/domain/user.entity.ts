import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  public recoveryExpiration: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 10 })
  public login: string;

  @Column({ type: 'varchar', length: 255 })
  public email: string;

  @Column()
  public password_hash: string;

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
}
