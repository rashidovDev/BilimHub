import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTestEntity1791568288568 implements MigrationInterface {
    name = 'AddedTestEntity1791568288568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum" AS ENUM('DRAFT', 'PUBLISHED')`);
        await queryRunner.query(`CREATE TYPE "public"."tests_visiblity_enum" AS ENUM('PUBLIC', 'PRIVATE')`);
        await queryRunner.query(`CREATE TABLE "tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "teacherId" character varying NOT NULL, "status" "public"."tests_status_enum" NOT NULL DEFAULT 'DRAFT', "visiblity" "public"."tests_visiblity_enum" NOT NULL DEFAULT 'PRIVATE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tests"`);
        await queryRunner.query(`DROP TYPE "public"."tests_visiblity_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum"`);
    }

}
