import { UserDomain } from '../domain/user.entity-domain';

export class UsersMapper {
  static toDomain(row: any): UserDomain {
    return new UserDomain(
      row.id,
      row.login,
      row.email,
      row.password_hash,
      row.created_at,
      row.updated_at,
      row.deleted_at,
      {
        confirmationCode: row.email_confirmation_code,
        isConfirmed: row.email_is_confirmed,
        expirationDate: row.email_confirmation_expiration,
      },
      {
        confirmationCode: row.recovery_code,
        isUsed: row.recovery_is_used,
        expirationDate: row.recovery_expiration,
      },
    );
  }

  static toPersistence(user: UserDomain) {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      deleted_at: user.deletedAt,
      email_confirmation_code: user.confirmationEmail.confirmationCode,
      email_is_confirmed: user.confirmationEmail.isConfirmed,
      email_confirmation_expiration: user.confirmationEmail.expirationDate,
      recovery_code: user.passwordRecovery.confirmationCode,
      recovery_is_used: user.passwordRecovery.isUsed,
      recovery_expiration: user.passwordRecovery.expirationDate,
    };
  }
}
