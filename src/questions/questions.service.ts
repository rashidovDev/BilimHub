import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Question } from './entities/question.entity.js';

@Injectable()
export class QuestionsService {
    constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly dataSource: DataSource,
  ) {}

  async reorderQuestions(
    testId: string, // Change this if Test.id is not a number.
    orderedQuestionIds: string[],
  ): Promise<{ success: true }> {
    if (new Set(orderedQuestionIds).size !== orderedQuestionIds.length) {
      throw new BadRequestException(
        'Question IDs must not contain duplicates.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const questionRepository = manager.getRepository(Question);

      // Lock the existing question rows while reordering.
      const questions = await questionRepository
        .createQueryBuilder('question')
        .where('question.test_id = :testId', { testId })
        .setLock('pessimistic_write')
        .getMany();

      if (questions.length !== orderedQuestionIds.length) {
        throw new BadRequestException(
          'Provide every question belonging to this test.',
        );
      }

      const questionById = new Map(
        questions.map((question) => [question.id, question]),
      );

      for (const id of orderedQuestionIds) {
        if (!questionById.has(id)) {
          throw new NotFoundException(
            `Question ${id} does not belong to this test.`,
          );
        }
      }

      const maxPosition = questions.reduce(
        (max, question) => Math.max(max, question.position),
        0,
      );

      // Phase 1: move all questions above the current range.
      for (let index = 0; index < orderedQuestionIds.length; index++) {
        const id = orderedQuestionIds[index];
        const question = questionById.get(id)!;

        await questionRepository.update(question.id, {
          position: maxPosition + index + 1,
        });
      }

      // Phase 2: assign the final positions 1...N.
      for (let index = 0; index < orderedQuestionIds.length; index++) {
        const id = orderedQuestionIds[index];
        const question = questionById.get(id)!;

        await questionRepository.update(question.id, {
          position: index + 1,
        });
      }

      return { success: true };
    });
  }
}
