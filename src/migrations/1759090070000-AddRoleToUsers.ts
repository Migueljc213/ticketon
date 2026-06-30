import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1759090070000 implements MigrationInterface {
  name = 'AddRoleToUsers1759090070000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
    );
    if (Number(row.cnt) === 0) {
      await queryRunner.query(
        `ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'participant'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
    );
    if (Number(row.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN role`);
    }
  }
}
