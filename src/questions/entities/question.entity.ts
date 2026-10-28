
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,

} from 'typeorm';
import { Test } from '../../tests/entities/test.entity.js';
import type { Relation } from 'typeorm';
import { QuestionType } from '../enums/question-type.enum.js';
import { QuestionOption } from './question-option.entity.js';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
  type: 'enum',
  enum: QuestionType,
})
type: QuestionType;

  @ManyToOne(
    () => Test,
    (test) => test.questions,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'test_id' })
  test: Relation<Test>;

  @OneToMany(
  () => QuestionOption,
  (option) => option.question,
)
options: QuestionOption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
