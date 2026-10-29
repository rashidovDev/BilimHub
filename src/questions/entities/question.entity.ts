
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Check,

} from 'typeorm';
import { Test } from '../../tests/entities/test.entity.js';
import type { Relation } from 'typeorm';
import { QuestionType } from '../enums/question-type.enum.js';
import { QuestionOption } from './question-option.entity.js';
import { QuestionAnswer } from './question-answer.entity.js';

@Index(
  'UQ_questions_test_position',
  ['test', 'position'],
  { unique: true },
)
@Check(
  'CHK_questions_position_positive',
  '"position" > 0',
)

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  position: number;

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

@OneToMany(
  () => QuestionAnswer,
  (answer) => answer.question,
)
answers: QuestionAnswer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
