import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserNotificationsTable1760400000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'system',
        title VARCHAR(200) NOT NULL,
        body TEXT NOT NULL,
        \`read\` TINYINT(1) NOT NULL DEFAULT 0,
        event_id INT NULL DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_un_user (user_id),
        INDEX idx_un_read (user_id, \`read\`),
        CONSTRAINT fk_un_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_notifications`);
  }
}
