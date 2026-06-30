import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDemographicsToUsers1761000000000 implements MigrationInterface {
  private async columnExists(queryRunner: QueryRunner, column: string): Promise<boolean> {
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
      [column],
    );
    return Number(row.cnt) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.columnExists(queryRunner, 'gender'))) {
      await queryRunner.query(`ALTER TABLE users ADD COLUMN gender VARCHAR(30) NULL`);
    }
    if (!(await this.columnExists(queryRunner, 'age'))) {
      await queryRunner.query(`ALTER TABLE users ADD COLUMN age INT NULL`);
    }
    if (!(await this.columnExists(queryRunner, 'neighborhood'))) {
      await queryRunner.query(`ALTER TABLE users ADD COLUMN neighborhood VARCHAR(100) NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.columnExists(queryRunner, 'gender')) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN gender`);
    }
    if (await this.columnExists(queryRunner, 'age')) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN age`);
    }
    if (await this.columnExists(queryRunner, 'neighborhood')) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN neighborhood`);
    }
  }
}
