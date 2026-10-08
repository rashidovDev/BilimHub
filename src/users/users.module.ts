import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersService } from './users.service.js';

@Module({
  imports : [
    TypeOrmModule.forFeature([User]),
    AuthModule
   ],
//   providers: [UsersService],
  controllers: [UsersController],
providers: [UsersService]
})
export class UsersModule {}
