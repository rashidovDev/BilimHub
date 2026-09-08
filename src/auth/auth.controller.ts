import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmailService } from './services/email.service.js';
import { AuthService } from './services/auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('request-otp')
  async requestOtp(
    @Body('email') email: string,
  ) {
    return this.authService.requestOtp(email);
  }


  @Post('verify-otp')
  async verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    return this.authService.verifyOtp(
      email,
      otp,
    );
  }
}