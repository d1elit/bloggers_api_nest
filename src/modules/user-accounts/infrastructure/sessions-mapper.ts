import { SessionDomain } from '../domain/session.domain-entity';

export class SessionsMapper {
  static toDomain(row: any): SessionDomain {
    return new SessionDomain(
      row.user_id,
      row.device_id,
      row.device_name,
      row.ip,
      row.iat,
      row.exp,
    );
  }
}
