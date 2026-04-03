import { DeviceListViewDto } from '../../api/view-dto/device-list.view-dto';
import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../domain/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  async findAll(userId: string): Promise<DeviceListViewDto[]> {
    const sessions = await this.sessionRepo.find({
      where: {
        userId,
      },
    });
    return DeviceListViewDto.mapToView(sessions);
  }
}
