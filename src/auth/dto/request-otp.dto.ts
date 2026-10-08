import {  PickType } from '@nestjs/mapped-types';
import { VerifyOtpDto } from './verify-otp.dto.js';

export class RequestOtpDto extends PickType(VerifyOtpDto, ['email'] as const) {}