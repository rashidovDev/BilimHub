import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller.js';
import { TestsService } from './tests.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity.js';

@Module({
  imports : [
  TypeOrmModule.forFeature([Test])
  ],
  controllers: [TestsController],
  providers: [TestsService]
})
export class TestsModule {}
