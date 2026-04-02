import { SessionsMapper } from '../../infrastructure/sessions-mapper';
import { SessionDomain } from '../../domain/session.domain-entity';

export class DeviceListViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(deviceList: SessionDomain[]) {
    return deviceList.map((raw) => {
      const session = SessionsMapper.toDomain(raw);
      return {
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: new Date(Number(session.iat) * 1000).toISOString(),
        deviceId: session.deviceId,
      };
    });
  }
}
