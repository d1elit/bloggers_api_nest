import { Session } from '../domain/session.entity';

export class SessionsMapper {
  static toDomain(row: any): Session {
    return new Session(
      row.user_id,
      row.device_id,
      row.device_name,
      row.ip,
      row.iat,
      row.exp,
    );
  }
}
