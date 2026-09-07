import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

    async verifyConnection(): Promise<void> {
    await this.transporter.verify();

    console.log('SMTP connection successful');
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const info = await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your BilimHub verification code',
      text: `Your BilimHub verification code is: ${otp}`,
      html: `
        <div>
          <h2>BilimHub</h2>
          <p>Your verification code is:</p>

          <h1>${otp}</h1>

          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log('Email preview:', nodemailer.getTestMessageUrl(info));
  }
}