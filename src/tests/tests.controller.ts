import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { User } from '../users/entities/user.entity.js';
import { TestsService } from './tests.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import type { AuthUser } from '../auth/types/auth-user.type.js';
import { UpdateTestDto } from './dto/update-test.dto.js';
import { Public } from '../common/decorators/public.decorator.js';
import { PublicTestsQueryDto } from './dto/public-tests-query.dto.js';

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
     return this.testsService.create(createTestDto, user.userId)
    }

@Post(':id/publish')
    @Roles(Role.TEACHER)
    publish(
        @Param('id', ParseUUIDPipe) id : string,
        @CurrentUser() user : AuthUser
    ){
    return this.testsService.publish(id, user.userId)
    }

@Patch(':id')
@Roles(Role.TEACHER)
update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateTestDto: UpdateTestDto,
  @CurrentUser() user: AuthUser,
) {
  return this.testsService.update(
    id,
    user.userId,
    updateTestDto,
  );
}

@Delete(':id')
@Roles(Role.TEACHER)
delete(
  @Param('id' , ParseUUIDPipe) id : string,
  @CurrentUser() user : AuthUser
){
return this.testsService.remove(id, user.userId)
}

  @Public()
  @Get('public')
  findPublicTests(
    @Query() query: PublicTestsQueryDto,
  ) {
    return this.testsService.findPublicTests(query);
  }

  @Get('my')
  @Roles(Role.TEACHER)
  findMyTests(
    @CurrentUser() user: AuthUser,
  ) {
    return this.testsService.findMyTests(user.userId);
  }

  @Get(':id')
  @Roles(Role.TEACHER)
  findOneForTeacher(
    @Param('id', ParseUUIDPipe) id: string,
     @CurrentUser() user: AuthUser,
  ) {
    return this.testsService.findOneForTeacher(
      id,
      user.userId,
    );
  }


}
