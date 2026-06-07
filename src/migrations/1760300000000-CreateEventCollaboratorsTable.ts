import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventCollaboratorsTable1760300000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS event_collaborators (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'SCANNER',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_event_user (event_id, user_id),
        CONSTRAINT fk_ec_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        CONSTRAINT fk_ec_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Adiciona a coluna apenas se ainda não existir
    const [cols] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'purchased_tickets' AND COLUMN_NAME = 'scanned_by'`,
    );
    if (Number(cols.cnt) === 0) {
      await queryRunner.query(
        `ALTER TABLE purchased_tickets ADD COLUMN scanned_by INT NULL DEFAULT NULL`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE purchased_tickets DROP COLUMN scanned_by`,
    );
    await queryRunner.query(`DROP TABLE event_collaborators`);
  }
}
