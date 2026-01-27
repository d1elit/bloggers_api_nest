import { DeviceListViewDto } from '../../api/view-dto/device-list.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Session, type SessionModelType } from '../../domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}

  async findAll(userId: string): Promise<DeviceListViewDto[]> {
    let sessions = await this.SessionModel.find({ userId: userId });
    return DeviceListViewDto.mapToView(sessions);
  }
}
