import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Session } from '../domain/session.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SessionsRepository {
  constructor(private dataSource: DataSource) {}

  async create(session: Session): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO sessions (
        user_id,
        device_id,
        device_name,
        ip,
        iat,
        exp
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        session.userId,
        session.deviceId,
        session.deviceName,
        session.ip,
        session.iat,
        session.exp,
      ],
    );
  }

  async find(iat: number, deviceId: string): Promise<Session | null> {
    const rows = await this.dataSource.query(
      `
      SELECT * FROM sessions
      WHERE iat = $1 AND device_id = $2
      `,
      [iat, deviceId],
    );

    if (!rows.length) return null;

    return this.mapRowToDomain(rows[0]);
  }

  async findByDeviceIdOrFail(deviceId: string): Promise<Session> {
    const rows = await this.dataSource.query(
      `SELECT * FROM sessions WHERE device_id = $1`,
      [deviceId],
    );

    if (!rows.length) {
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

    return this.mapRowToDomain(rows[0]);
  }

  async update(iat: number, exp: number, oldVersion: number): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE sessions
      SET iat = $1,
          exp = $2
      WHERE iat = $3
      `,
      [iat, exp, oldVersion],
    );
  }

  async delete(iat: number): Promise<void> {
    await this.dataSource.query(`DELETE FROM sessions WHERE iat = $1`, [iat]);
  }

  async deleteExceptCurrent(deviceId: string) {
    await this.dataSource.query(
      `
      DELETE FROM sessions
      WHERE device_id <> $1
      `,
      [deviceId],
    );
  }
  async deleteByDevice(deviceId: string) {
    await this.dataSource.query(
      `
        DELETE FROM sessions
        WHERE device_id = $1
      `,
      [deviceId],
    );
  }

  async findAll(userId: string): Promise<Session[]> {
    const rows = await this.dataSource.query(
      `SELECT * FROM sessions WHERE user_id = $1`,
      [userId],
    );

    return rows.map(this.mapRowToDomain);
  }

  private mapRowToDomain(row: any): Session {
    return new Session(
      row.user_id,
      row.device_id,
      row.device_name,
      row.ip,
      row.iat,
      row.exp,
    );
  }
}
