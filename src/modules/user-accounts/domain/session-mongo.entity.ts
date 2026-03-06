import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type SessionDto = {
  userId: string;
  deviceId: string;
  deviceName: string;
  ip: string;
  iat: number;
  exp: number;
};

@Schema({ collection: 'sessions' })
export class SessionMongo {
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

  static createNew(sessionDto: SessionDto): SessionMongo {
    const session = new SessionMongo();
    session.userId = sessionDto.userId;
    session.deviceId = sessionDto.deviceId;
    session.deviceName = sessionDto.deviceName;
    session.ip = sessionDto.ip;
    session.iat = sessionDto.iat;
    session.exp = sessionDto.exp;
    return session;
  }
}

export const SessionSchema = SchemaFactory.createForClass(SessionMongo);
SessionSchema.loadClass(SessionMongo);

export type SessionDocument = HydratedDocument<SessionMongo>;
export type SessionModelType = Model<SessionMongo> & typeof SessionMongo;
