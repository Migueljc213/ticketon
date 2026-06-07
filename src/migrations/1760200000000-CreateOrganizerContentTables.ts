import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizerContentTables1760200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS organizer_posts (
        id          INT PRIMARY KEY AUTO_INCREMENT,
        organizer_id INT NOT NULL,
        content     TEXT NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_op_organizer_id (organizer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS organizer_polls (
        id           INT PRIMARY KEY AUTO_INCREMENT,
        organizer_id INT NOT NULL,
        question     VARCHAR(500) NOT NULL,
        options      JSON NOT NULL,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_opoll_organizer_id (organizer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id           INT PRIMARY KEY AUTO_INCREMENT,
        poll_id      INT NOT NULL,
        user_id      INT NOT NULL,
        option_index TINYINT NOT NULL,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_poll_user (poll_id, user_id),
        INDEX idx_pv_poll_id (poll_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS poll_votes`);
    await queryRunner.query(`DROP TABLE IF EXISTS organizer_polls`);
    await queryRunner.query(`DROP TABLE IF EXISTS organizer_posts`);
  }
}
