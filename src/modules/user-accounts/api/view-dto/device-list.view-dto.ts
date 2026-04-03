import { Session } from '../../domain/session.entity';

export class DeviceListViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(deviceList: Session[]) {
    return deviceList.map((raw) => {
      return {
        ip: raw.ip,
        title: raw.deviceName,
        lastActiveDate: new Date(Number(raw.iat) * 1000).toISOString(),
        deviceId: raw.deviceId,
      };
    });
  }
}
