
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { Question } from './question.entity.js';
import { QuestionOption } from './question-option.entity.js';
import type { Relation } from 'typeorm';


@Entity('question_answers')
@Check(
  'CHK_question_answers_one_answer_value',
  `(
    ("option_id" IS NOT NULL AND "accepted_text" IS NULL)
    OR
    ("option_id" IS NULL AND "accepted_text" IS NOT NULL)
  )`,
)
export class QuestionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Question,
    (question) => question.answers,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'question_id' })
  question: Relation<Question>;

  @ManyToOne(
    () => QuestionOption,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'option_id' })
  option: QuestionOption | null;

  @Column({
    name: 'accepted_text',
    type: 'text',
    nullable: true,
  })
  acceptedText: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
