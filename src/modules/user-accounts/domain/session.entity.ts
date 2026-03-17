import { SessionDto } from './dto/session.domain.dto';

export class Session {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public iat: number,
    public exp: number,
  ) {}

  static createNew(dto: SessionDto): Session {
    return new Session(
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
