import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOtp } from './entities/email-otp.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './services/auth.service.js';

@Module({
  imports : [
  TypeOrmModule.forFeature([
    User,
    EmailOtp
  ])
  ],
  providers: [EmailService, AuthService],
  exports: [EmailService, AuthService],
  controllers : [AuthController]
})
export class AuthModule {}