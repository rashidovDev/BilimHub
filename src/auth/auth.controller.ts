import { Body, Controller,Post, Req, Res, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './services/auth.service.js';
import type { Request, Response } from 'express';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { RequestOtpDto } from './dto/request-otp.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }


  @Public()
  @Post('request-otp')
  async requestOtp(
    @Body('') requestOtpDto : RequestOtpDto,
  ) {
    return this.authService.requestOtp(requestOtpDto.email);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(
    @Body() verifyOtpDto : VerifyOtpDto,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const { accessToken, refreshToken } = 
    await this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);

    response.cookie(
      'refresh_token',
      refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === 'production',

        sameSite: 'lax',

        maxAge:
          7 * 24 * 60 * 60 * 1000,
      },
    );

    return {
      accessToken,
    };
  }

 @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found',
      );
    }

    const result =
      await this.authService.refresh(
        refreshToken,
      );

    response.cookie(
      'refresh_token',
      result.refreshToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV === 'production',

        sameSite: 'lax',

        maxAge:
          7 * 24 * 60 * 60 * 1000,
      },
    );

    return {
      accessToken: result.accessToken,
    };

  }

  @Post('logout')
async logout(
  @Req() req: Request,
  @Res({ passthrough: true })
  res: Response,
) {
  const refreshToken =
    req.cookies?.refresh_token;

  if (refreshToken) {
    await this.authService.logout(
      refreshToken,
    );
  }

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  return {
    message: 'Logged out successfully',
  };
}


}