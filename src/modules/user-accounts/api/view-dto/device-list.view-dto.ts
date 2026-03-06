import { SessionDocument } from '../../domain/session-mongo.entity';

export class DeviceListViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(deviceList: SessionDocument[]) {
    return deviceList.map((session) => {
      return {
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: new Date(Number(session.iat) * 1000).toISOString(),
        deviceId: session.deviceId,
      };
    });
  }
}
