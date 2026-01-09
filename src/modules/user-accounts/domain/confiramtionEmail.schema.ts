import { Prop } from '@nestjs/mongoose';

export class confirmationEmail {
  @Prop({ required: true })
  firstName: string;

  @Prop({ type: String, required: false, default: null })
  lastName: string | null;
}
