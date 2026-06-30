import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBankAccountsTable1760700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        bank_code   VARCHAR(10) NOT NULL,
        bank_name   VARCHAR(100) NOT NULL,
        agency      VARCHAR(20) NOT NULL,
        account_number VARCHAR(30) NOT NULL,
        account_type ENUM('corrente','poupanca') NOT NULL DEFAULT 'corrente',
        holder_name VARCHAR(255) NOT NULL,
        holder_cpf_cnpj VARCHAR(20) NOT NULL,
        pix_key     VARCHAR(255) NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_bank_accounts_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // MySQL não suporta DROP COLUMN IF EXISTS — verifica via INFORMATION_SCHEMA
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bank_info'`,
    );
    if (Number(row.cnt) > 0) {
      await queryRunner.query(`ALTER TABLE users DROP COLUMN bank_info`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bank_accounts`);

    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'bank_info'`,
    );
    if (Number(row.cnt) === 0) {
      await queryRunner.query(`ALTER TABLE users ADD COLUMN bank_info TEXT NULL`);
    }
  }
}
