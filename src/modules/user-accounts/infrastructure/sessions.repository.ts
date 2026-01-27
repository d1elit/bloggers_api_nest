import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,
  ) {}
  async create(session: Session) {
    await this.SessionModel.create(session);
  }

  async find(iat: number, deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ iat: iat, deviceId: deviceId });
  }

  findByDeviceIdOrFail(deviceId: string) {
    const session = this.SessionModel.findOne({ deviceId: deviceId });
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'device',
            message: 'Device not found',
          },
        ],
      });
    }
    return session;
  }

  async update(iat: number, exp: number, oldVersion: number) {
    console.log('iat in db:', iat, 'exp', exp);
    await this.SessionModel.updateOne(
      { iat: oldVersion },
      { $set: { iat: iat, exp: exp } },
    );
  }

  async delete(iat: number) {
    await this.SessionModel.deleteOne({ iat: iat });
  }

  async deleteByDevice(deviceId: string) {
    await this.SessionModel.deleteOne({ deviceId: deviceId });
  }

  async deleteExceptCurrent(deviceId: string) {
    await this.SessionModel.deleteMany({ deviceId: { $ne: deviceId } });
  }

  async findAll(userId: string) {
    return this.SessionModel.find({ userId: userId });
  }
}
