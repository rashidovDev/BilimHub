import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedStatusColumnToTestEntity1791407395479 implements MigrationInterface {
    name = 'AddedStatusColumnToTestEntity1791407395479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "status" "public"."tests_status_enum" NOT NULL DEFAULT 'DRAFT'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum"`);
    }

}
