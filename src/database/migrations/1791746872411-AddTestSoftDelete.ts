import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestSoftDelete1791746872411 implements MigrationInterface {
    name = 'AddTestSoftDelete1791746872411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "deletedAt"`);
    }

}
