import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './entities/test.entity.js';
import { IsNull, Repository } from 'typeorm';
import { CreateTestDto } from './dto/create-test.dto.js';
import { TestVisibility } from './enums/test-visibility.enum.js';
import { TestStatus } from './enums/test-status.enum.js';
import { UpdateTestDto } from './dto/update-test.dto.js';
import { PublicTestsQueryDto, TestSortOrder } from './dto/public-tests-query.dto.js';

@Injectable()
export class TestsService {
    constructor(
        @InjectRepository(Test)
        private readonly testsRepository: Repository<Test>) { }

    async create(
        createTestDto: CreateTestDto,
        teacherId: string
    ) {
        const test = this.testsRepository.create({
            ...createTestDto,
            teacherId,
            visiblity: TestVisibility.PRIVATE,
            status: TestStatus.DRAFT
        })

        await this.testsRepository.save(test)

        return { message: "Succesfully created" }
    }

    async publish(testId: string, teacherId: string) {
        const test = await this.testsRepository.findOne({
            where: { id: testId }
        })

        if (!test) {
            throw new NotFoundException('Test not found')
        }

        if (test.teacherId !== teacherId) {
            throw new ForbiddenException('You cannot publish another teacher\'s test')
        }

        if (test.status !== TestStatus.DRAFT) {
            throw new ConflictException(
                'Only draft tests can be published',
            );
        }

        test.status = TestStatus.PUBLISHED;

        return this.testsRepository.save(test);
    }

    async update(testId: string, teacherId: string, updateTestDto: UpdateTestDto) {

        const hasChanges = updateTestDto.description !== undefined || updateTestDto.title !== undefined;

        if (!hasChanges) {
            throw new BadRequestException(
                'At least one field must be provided',
            );
        }

        const test = await this.testsRepository.findOne({
            where: { id: testId },
        });

        if (!test) {
            throw new NotFoundException('Test not found');
        }

        if (test.teacherId !== teacherId) {
            throw new ForbiddenException(
                'You cannot edit another teacher\'s test',
            );
        }

        if (test.status !== TestStatus.DRAFT) {
            throw new ConflictException(
                'Only draft tests can be edited',
            );
        }

        Object.assign(test, updateTestDto);

        return this.testsRepository.save(test);
    }

   async remove(testId: string, teacherId: string) {
  const test = await this.testsRepository.findOne({
    where: { id: testId },
  });

  if (!test) {
    throw new NotFoundException('Test not found');
  }

  if (test.teacherId !== teacherId) {
    throw new ForbiddenException(
      'You cannot delete another teacher\'s test',
    );
  }

  if (test.status !== TestStatus.DRAFT) {
    throw new ConflictException(
      'Only draft tests can be deleted',
    );
  }

  await this.testsRepository.softRemove(test);

  return {
    message: 'Test deleted successfully',
  };
}

async findPublicTests(query: PublicTestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortOrder =
      query.sortOrder ?? TestSortOrder.DESC;

    const skip = (page - 1) * limit;

    const [tests, total] =
      await this.testsRepository.findAndCount({
        where: {
          status: TestStatus.PUBLISHED,
          visiblity: TestVisibility.PUBLIC,
        },

        // Return only fields intended for the public catalog.
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
        },

        order: {
          createdAt: sortOrder,
        },

        skip,
        take: limit,
      });

    return {
      data: tests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyTests(teacherId: string) {
  return this.testsRepository.find({
    where: {
      teacherId,
    },
    order: {
      createdAt: 'DESC',
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      visiblity: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async findOneForTeacher(testId : string,teacherId : string){
    const test = await this.testsRepository.findOne({
        where : {
            id : testId
        }
    })

    if(!test){
        throw new NotFoundException('Test not found')
    }

    if(test.teacherId !== teacherId){
        throw new NotFoundException('Test not found')
    }

    return test
}

}
