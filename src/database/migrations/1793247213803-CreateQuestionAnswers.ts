import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateQuestionAnswers1793247213803 implements MigrationInterface {
    name = 'CreateQuestionAnswers1793247213803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accepted_text" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "question_id" uuid NOT NULL, "option_id" integer, CONSTRAINT "CHK_question_answers_one_answer_value" CHECK ((
    ("option_id" IS NOT NULL AND "accepted_text" IS NULL)
    OR
    ("option_id" IS NULL AND "accepted_text" IS NOT NULL)
  )), CONSTRAINT "PK_5257525a7773e5159714a3eb13c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_answers" ADD CONSTRAINT "FK_941b909bd831f96c46d389ccde4" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_answers" ADD CONSTRAINT "FK_c42547cfd74dcbcb28d50b8762f" FOREIGN KEY ("option_id") REFERENCES "question_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_answers" DROP CONSTRAINT "FK_c42547cfd74dcbcb28d50b8762f"`);
        await queryRunner.query(`ALTER TABLE "question_answers" DROP CONSTRAINT "FK_941b909bd831f96c46d389ccde4"`);
        await queryRunner.query(`DROP TABLE "question_answers"`);
    }

}
