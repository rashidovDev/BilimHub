import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service.js';
import { QuestionsController } from './questions.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity.js';
import { QuestionOption } from './entities/question-option.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Question, QuestionOption])],
  providers: [QuestionsService],
  controllers: [QuestionsController]
})
export class QuestionsModule {}
