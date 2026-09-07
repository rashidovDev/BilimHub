import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailOtps1788752830032 implements MigrationInterface {
    name = 'CreateEmailOtps1788752830032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "otpHash" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "usedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c66a6bae8086377ae2b0f5b177e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_otps" ADD CONSTRAINT "FK_feb32eedcddde6b353669a0a973" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_otps" DROP CONSTRAINT "FK_feb32eedcddde6b353669a0a973"`);
        await queryRunner.query(`DROP TABLE "email_otps"`);
    }

}
