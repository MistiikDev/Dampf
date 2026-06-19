import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshTokenUserMigration1781871332550 implements MigrationInterface {
    name = 'RefreshTokenUserMigration1781871332550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_private_entity" ADD "refresh_token" character varying`);
        await queryRunner.query(`ALTER TABLE "user_private_entity" ADD "refresh_token_blacklist" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_private_entity" DROP COLUMN "refresh_token_blacklist"`);
        await queryRunner.query(`ALTER TABLE "user_private_entity" DROP COLUMN "refresh_token"`);
    }

}
