import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service.js';
import { AuthController } from './auth.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailOtp } from './entities/email-otp.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './services/auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { RefreshSession } from './entities/refresh-session.entity.js';
import { TokenService } from './services/token.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports : [
  JwtModule.register({}),
   
 PassportModule.register({ defaultStrategy: 'jwt' }),
  TypeOrmModule.forFeature([
    User,
    EmailOtp,
    RefreshSession
  ])
  ],
  providers: [EmailService, AuthService, TokenService, JwtStrategy],
  exports: [EmailService, AuthService, TokenService, JwtStrategy,PassportModule ],
  controllers : [AuthController]
})
export class AuthModule {}