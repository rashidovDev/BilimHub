import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  providers: [EmailService],
  exports: [EmailService],
  controllers : [AuthController]
})
export class AuthModule {}