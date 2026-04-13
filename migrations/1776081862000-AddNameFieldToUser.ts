import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNameFieldToUser1776081862000 implements MigrationInterface {
    name = 'AddNameFieldToUser1776081862000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying(10) COLLATE "C"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
