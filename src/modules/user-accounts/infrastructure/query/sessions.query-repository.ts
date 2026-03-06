import { DeviceListViewDto } from '../../api/view-dto/device-list.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  SessionMongo,
  type SessionModelType,
} from '../../domain/session-mongo.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(SessionMongo.name)
    private SessionModel: SessionModelType,
  ) {}

  async findAll(userId: string): Promise<DeviceListViewDto[]> {
    let sessions = await this.SessionModel.find({ userId: userId });
    return DeviceListViewDto.mapToView(sessions);
  }
}
