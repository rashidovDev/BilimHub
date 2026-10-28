import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionType1793166476380 implements MigrationInterface {
    name = 'AddQuestionType1793166476380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER')`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "type" "public"."questions_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
    }

}
