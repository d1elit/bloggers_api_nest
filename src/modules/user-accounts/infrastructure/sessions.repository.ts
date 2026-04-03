import { Injectable } from '@nestjs/common';
import { DataSource, Not, Repository } from 'typeorm';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../domain/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
  ) {}

  async save(session: Session) {
    return this.sessionRepo.save(session);
  }

  async find(iat: number, deviceId: string): Promise<Session | null> {
    const session = await this.sessionRepo.findOneBy({
      iat,
      deviceId,
    });

    if (!session) return null;

    return session;
  }

  async findByIat(iat: number): Promise<Session | null> {
    const session = await this.sessionRepo.findOneBy({
      iat,
    });

    if (!session) return null;

    return session;
  }

  async findByDeviceIdOrFail(deviceId: string): Promise<Session> {
    const session = await this.sessionRepo.findOneBy({ deviceId });

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

  async delete(iat: number): Promise<void> {
    // DELETE FROM sessions WHERE iat = $1
    await this.sessionRepo.delete({ iat });
  }

  async deleteExceptCurrent(deviceId: string): Promise<void> {
    // DELETE FROM sessions WHERE device_id <> $1
    // Для оператора "не равно" (<>) в TypeORM используется Not
    await this.sessionRepo.delete({
      deviceId: Not(deviceId),
    });
  }

  async deleteByDevice(deviceId: string): Promise<void> {
    // DELETE FROM sessions WHERE device_id = $1
    await this.sessionRepo.delete({ deviceId });
  }
}
