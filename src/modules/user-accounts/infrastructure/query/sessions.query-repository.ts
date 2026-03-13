import { DeviceListViewDto } from '../../api/view-dto/device-list.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  SessionMongo,
  type SessionModelType,
} from '../../domain/session-mongo.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(SessionMongo.name)
    private SessionModel: SessionModelType,
    private dataSource: DataSource,
  ) {}

  async findAll(userId: string): Promise<DeviceListViewDto[]> {
    const result = await this.dataSource.query(
      `
    SELECT * FROM SESSIONS where user_id = $1`,
      [userId],
    );

    return DeviceListViewDto.mapToView(result);
  }
}
