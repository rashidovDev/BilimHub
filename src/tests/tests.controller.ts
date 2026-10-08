import { Body, Controller, Post } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { TestsService } from './tests.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';

@Controller('tests')
export class TestsController {
    constructor(
    private readonly testsService : TestsService  
    ){}

    @Post('create')
    @Roles(Role.TEACHER)
    create(
        @Body() createTestDto : CreateTestDto,
        @CurrentUser() user : AuthUser
    ){
        console.log(user)
     return this.testsService.create(createTestDto, user.userId.toString())
    }
}
