import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDemographicsToUsers1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        ADD COLUMN gender VARCHAR(30) NULL,
        ADD COLUMN age INT NULL,
        ADD COLUMN neighborhood VARCHAR(100) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
        DROP COLUMN gender,
        DROP COLUMN age,
        DROP COLUMN neighborhood
    `);
  }
}
