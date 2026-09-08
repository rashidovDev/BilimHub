import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { EmailOtp } from '../entities/email-otp.entity.js';
import { compareOtp, generateOtp, getOtpExpiration, hashOtp } from '../utils/otp.util.js';
import { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_SECONDS } from '../constants/auth.constants.js';
import { EmailService } from './email.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(EmailOtp)
    private readonly emailOtpRepository: Repository<EmailOtp>,

    private readonly emailService : EmailService
  ) {}

  // REQUEST OTP
  async requestOtp(email: string) {
  //  Find existing user
  let user = await this.userRepository.findOne({
    where: { email },
  });

  // Create user if they don't exist
  if (!user) {
    user = this.userRepository.create({
      email,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);
  }

  const latestOtp = await this.emailOtpRepository.findOne({
    where: {
      userId: user.id,
      usedAt: IsNull()
    },
    order: {
      createdAt: 'DESC',
    },
  });

  // 4. Check resend cooldown
  if (latestOtp) {
    const now = new Date();

    const elapsedSeconds =
      (now.getTime() - latestOtp.createdAt.getTime()) / 1000;

      console.log("ELAPSED",elapsedSeconds)
    if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new BadRequestException(
        'Please wait before requesting another OTP.',
      );
    }
  }

  //  Invalidate previous unused OTPs
  await this.emailOtpRepository
    .createQueryBuilder()
    .update(EmailOtp)
    .set({
      usedAt: new Date(),
    })
    .where('userId = :userId', {
      userId: user.id,
    })
    .andWhere('usedAt IS NULL')
    .execute();


  //  Generate new OTP
  const otp = generateOtp();

  //  Hash OTP
  const otpHash = await hashOtp(otp);

  //  Calculate expiration
  const expiresAt = getOtpExpiration();

  //  Create OTP record
  const emailOtp = this.emailOtpRepository.create({
    userId: user.id,
    otpHash,
    expiresAt,
  });

  await this.emailOtpRepository.save(emailOtp);

  //  Send OTP email
  await this.emailService.sendOtp(
    email,
    otp,
  );

  return {
    message: 'If the email can receive a code, an OTP has been sent.',
  };
}

  // VERIFY OTP
  async verifyOtp(email: string, otp: string) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or OTP');
    }

    // Find latest unused OTP
    const emailOtp = await this.emailOtpRepository.findOne({
      where: {
        userId: user.id,
        usedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    
    if (!emailOtp) {
        throw new BadRequestException('Invalid or expired OTP');
    }
    
    if(emailOtp?.attempts >= OTP_MAX_ATTEMPTS){
        throw new BadRequestException(
            'Too many attempts. Please request a new OTP.',
        )
    }

    // Check expiration
    if (emailOtp.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

     // Compare OTP
    const isValid = await compareOtp(
    otp,
    emailOtp.otpHash,
  );

  if (!isValid) {
    emailOtp.attempts += 1;

    await this.emailOtpRepository.save(emailOtp)

    throw new BadRequestException('Invalid OTP');
  }

  // Mark OTP as used
  emailOtp.usedAt = new Date();

  await this.emailOtpRepository.save(emailOtp);

  // Verify user's email
  user.isEmailVerified = true;

  await this.userRepository.save(user);

  return {
    message: 'Email verified successfully',
  };
  }

}