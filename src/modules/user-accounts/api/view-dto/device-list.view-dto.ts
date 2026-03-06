import { SessionDocument } from '../../domain/session-mongo.entity';
import { SessionsMapper } from '../../infrastructure/sessions-mapper';

export class DeviceListViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(deviceList: SessionDocument[]) {
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
