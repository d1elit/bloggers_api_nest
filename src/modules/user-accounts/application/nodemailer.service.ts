import { Injectable } from '@nestjs/common';

import nodemailer from 'nodemailer';

@Injectable()
export class NodemailerService {
  async sendEmail(email: string, template: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dropdox12@gmail.com',
        pass: 'gbjw pcdy yalr enkl',
      },
    });
    console.log('email sending', email);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      await transporter.sendMail({
        from: '"Kek 👻"  <dropdox12@gmail.com>',
        to: email,
        subject: 'RegistrationInput',
        html: template, // html body
      });
      return;
    } catch (e: unknown) {
      console.log('Sending email failed', e);
    }
  }
}
