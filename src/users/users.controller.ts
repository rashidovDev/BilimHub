import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { UsersService } from './users.service.js';
import { Role } from '../common/enums/role.enum.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('users')
export class UsersController {
  constructor(
     private readonly usersService : UsersService
    ){}


@Get('me')
getMe(@CurrentUser() user: AuthUser,) {
  return user;
}

@Roles(Role.ADMIN)
@Get()
async getAllUsers(){
  return await this.usersService.getAllUsers()
}

}