import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './entities/test.entity.js';
import { Repository } from 'typeorm';
import { CreateTestDto } from './dto/create-test.dto.js';
import { TestVisibility } from './enums/test-visibility.enum.js';
import { TestStatus } from './enums/test-status.enum.js';

@Injectable()
export class TestsService {
    constructor(
        @InjectRepository(Test)
        private readonly testsRepository : Repository<Test> ){}

        async create(
            createTestDto : CreateTestDto,
            teacherId : string
        ){
            const test = this.testsRepository.create({
            ...createTestDto,
            teacherId,
            visiblity : TestVisibility.PRIVATE,
            status : TestStatus.DRAFT
            })

            await this.testsRepository.save(test)

            return {message : "Succesfully created"}
        }
}
