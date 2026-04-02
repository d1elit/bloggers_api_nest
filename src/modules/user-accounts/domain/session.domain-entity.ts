import { SessionDto } from './dto/session.domain.dto';

export class SessionDomain {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public iat: number,
    public exp: number,
  ) {}

  static createNew(dto: SessionDto): SessionDomain {
    return new SessionDomain(
      dto.userId,
      dto.deviceId,
      dto.deviceName,
      dto.ip,
      dto.iat,
      dto.exp,
    );
  }

  updateTokens(iat: number, exp: number) {
    this.iat = iat;
    this.exp = exp;
  }
}
