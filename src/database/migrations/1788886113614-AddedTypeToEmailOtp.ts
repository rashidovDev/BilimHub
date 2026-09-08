import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTypeToEmailOtp1788886113614 implements MigrationInterface {
    name = 'AddedTypeToEmailOtp1788886113614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_otps" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "email_otps" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_otps" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "email_otps" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
