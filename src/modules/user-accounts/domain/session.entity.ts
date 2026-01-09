import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { User } from './user.entity';

export type SessionDto = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  iat: number;
  exp: number;
};

@Schema({ collection: 'sessions' })
export class Session {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  deviceId!: string;

  @Prop({ required: true })
  deviceName!: string;

  @Prop({ required: true })
  ip!: string;

  @Prop({ required: true })
  iat!: number;

  @Prop({ required: true })
  exp!: number;

  static createNew(sessionDto: SessionDto): Session {
    const session = new Session();
    session.userId = sessionDto.userId;
    session.deviceId = sessionDto.deviceId;
    session.deviceName = sessionDto.deviceName;
    session.ip = sessionDto.ip;
    session.iat = sessionDto.iat;
    session.exp = sessionDto.exp;
    return session;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;
export type SessionModelType = Model<Session> & typeof Session;
