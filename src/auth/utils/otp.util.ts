import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(
  otp: string,
  otpHash: string,
): Promise<boolean> {
  return bcrypt.compare(otp, otpHash);
}

export function getOtpExpiration(): Date {
  const expiration = new Date();

  expiration.setMinutes(
    expiration.getMinutes() + 5,
  );

  return expiration;
}