import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { EmailOtp } from '../entities/email-otp.entity.js';
import { compareOtp, generateOtp, getOtpExpiration, hashOtp } from '../utils/otp.util.js';
import { OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_SECONDS } from '../constants/auth.constants.js';
import { EmailService } from './email.service.js';
import { TokenService } from './token.service.js';
import { hashRefreshToken } from '../utils/token.util.js';
import { RefreshSession } from '../entities/refresh-session.entity.js';
import { createHash, randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  EntityManager,
} from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(EmailOtp)
    private readonly emailOtpRepository: Repository<EmailOtp>,

    @InjectRepository(RefreshSession)
    private readonly refreshSessionRepository : Repository<RefreshSession>,

    private readonly dataSource: DataSource,

    private readonly tokenService : TokenService,

    private readonly emailService : EmailService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,
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

  const familyId = randomUUID();
  const sessionId = randomUUID();

  const payload = {
      sub: user.id,
      email: user.email,
      role : user.role
    };

  const accessToken = await this.tokenService.createAccessToken(payload)
  const refreshToken = await this.tokenService.createRefreshToken(payload, sessionId, familyId)
  
  const tokenHash =  hashRefreshToken(refreshToken)

   const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000,
    );

   await this.refreshSessionRepository.save({
      id : sessionId,
      user,
      tokenHash,
      familyId,
      expiresAt,
      revokedAt: null,
    });

  return {
    accessToken,
    refreshToken,
    // message: 'Email verified successfully',
  };
  }

async refresh(refreshToken: string) {
  let payload: {
    sub: string;
    email: string;
    role: string;
    sid: string;
    familyId: string;
  };

  // 1. Verify JWT
  try {
    payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  } catch {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const { sub: userId, sid: sessionId, familyId, role } = payload;
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

  return await this.dataSource.transaction(async (manager) => {
    const sessionRepository = manager.getRepository(RefreshSession);

    // 2. Find + Row-level Lock
    const session = await sessionRepository
      .createQueryBuilder('session')
      .where('session.id = :sessionId', { sessionId })
      .setLock('pessimistic_write')
      .getOne();

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Robust Reuse Detection (Nuclear Option)
    if (session.revokedAt) {
      // Force-revoke every single token belonging to this compromised family chain
      await sessionRepository.update(
        { familyId: session.familyId }, 
        { revokedAt: new Date() }
      );
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // 4. Data Consistency Validations
    if (session.familyId !== familyId || session.userId !== userId || session.tokenHash !== tokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 5. Expiration validation with 30s clock skew leeway
    const leewayBuffer = 30 * 1000;
    if (session.expiresAt.getTime() + leewayBuffer < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // --- GRACE PERIOD LOGIC HINT (Optional Solution for Frontends) ---
    // If you want to solve the multi-tab race condition, instead of failing on session.revokedAt,
    // check if session.revokedAt was within the last 5-10 seconds. If so, return the *already generated* pair.

    // 6. Rotate State
    const now = new Date();
    session.revokedAt = now;
    await sessionRepository.save(session);

    // 7. Mint and Hash New Session Assets
    const newSessionId = randomUUID();
    const newRefreshToken = await this.tokenService.createRefreshToken(
      { sub: userId, email: payload.email, role: role },
      newSessionId,
      familyId,
    );

    const newTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');

    await sessionRepository.save({
      id: newSessionId,
      userId,
      familyId,
      role,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    const newAccessToken = await this.tokenService.createAccessToken({
      sub: userId,
      email: payload.email,
      role: role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  });
}


  async logout(refreshToken: string): Promise<void> {
  let payload: {
    sub: number;
    email: string;
    sid: string;
    familyId: string;
  };

  // 1. Verify refresh token
  try {
    payload =
      await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret:
            this.configService.getOrThrow<string>(
              'JWT_REFRESH_SECRET',
            ),
        },
      );
  } catch {
    // Token is already invalid/expired.
    // Logout can still be considered successful.
    return;
  }

  // 2. Revoke session
  await this.refreshSessionRepository.update(
    {
      id: payload.sid,
      revokedAt: IsNull(),
    },
    {
      revokedAt: new Date(),
    },
  );
}

async logoutAll(userId: string): Promise<void> {
  await this.refreshSessionRepository.update(
    {
      userId,
      revokedAt: IsNull(),
    },
    {
      revokedAt: new Date(),
    },
  );
}
}
