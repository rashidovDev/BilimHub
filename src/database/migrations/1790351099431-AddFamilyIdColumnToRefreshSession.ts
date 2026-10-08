import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilyIdColumnToRefreshSession1790351099431 implements MigrationInterface {
    name = 'AddFamilyIdColumnToRefreshSession1790351099431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_sessions" ADD "familyId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_sessions" DROP COLUMN "familyId"`);
    }

}
