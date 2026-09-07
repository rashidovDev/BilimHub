import { Controller, Get } from '@nestjs/common';
import { EmailService } from './services/email.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Get('test-email')
  async testEmail() {
    await this.emailService.sendOtp(
      'test@example.com',
      '482913',
    );

    return {
      message: 'Test email sent',
    };
  }
}