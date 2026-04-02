import { SessionDto } from './dto/session.domain.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @Column({ name: 'user_id', type: 'uuid' })
  public userId: string;
  @PrimaryGeneratedColumn('uuid', { name: 'device_id' })
  public deviceId: string;
  @Column({ name: 'device_name' })
  public deviceName: string;
  @Column()
  public ip: string;
  @Column()
  public iat: number;
  @Column()
  public exp: number;

  static createNew(dto: SessionDto): Session {
    const session = new Session();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;
    session.iat = dto.iat;
    session.exp = dto.exp;

    return session;
  }

  update(iat: number, exp: number) {
    this.iat = iat;
    this.exp = exp;
  }
}
