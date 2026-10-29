import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionPosition1793252312014 implements MigrationInterface {
    name = 'AddQuestionPosition1793252312014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create the column as NULLABLE so existing rows don't cause an error
        await queryRunner.query(`ALTER TABLE "questions" ADD "position" integer`);

        // 2. Safely populate positions sequentially for your existing data
        await queryRunner.query(`
            WITH numbered_questions AS (
                SELECT
                    "id",
                    ROW_NUMBER() OVER (
                        PARTITION BY "test_id"
                        ORDER BY "createdAt" ASC, "id" ASC
                    ) AS new_position
                FROM "questions"
            )
            UPDATE "questions" AS q
            SET "position" = nq.new_position
            FROM numbered_questions AS nq
            WHERE q."id" = nq."id"::uuid
        `);

        // 3. Now that every row has a position, safely enforce NOT NULL
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "position" SET NOT NULL`);

        // 4. Add your unique index and positive check constraints
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_questions_test_position" ON "questions" ("test_id", "position")`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "CHK_questions_position_positive" CHECK ("position" > 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "CHK_questions_position_positive"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_questions_test_position"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "position"`);
    }
}

