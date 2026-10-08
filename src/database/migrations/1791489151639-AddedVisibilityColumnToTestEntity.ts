import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedVisibilityColumnToTestEntity1791489151639 implements MigrationInterface {
    name = 'AddedVisibilityColumnToTestEntity1791489151639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tests_visiblity_enum" AS ENUM('PUBLIC', 'PRIVATE')`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "visiblity" "public"."tests_visiblity_enum" NOT NULL DEFAULT 'PRIVATE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "visiblity"`);
        await queryRunner.query(`DROP TYPE "public"."tests_visiblity_enum"`);
    }

}
