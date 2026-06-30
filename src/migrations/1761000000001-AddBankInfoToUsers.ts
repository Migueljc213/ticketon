import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBankInfoToUsers1761000000001 implements MigrationInterface {
  private async columnExists(queryRunner: QueryRunner, column: string): Promise<boolean> {
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
      [column],
    );
    return Number(row.cnt) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await this.columnExists(queryRunner, 'bank_info'))) {
      await queryRunner.query(`ALTER TABLE users ADD COLUMN bank_info TEXT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.columnExists(queryRunner, 'bank_info')) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN bank_info`);
    }
  }
}
