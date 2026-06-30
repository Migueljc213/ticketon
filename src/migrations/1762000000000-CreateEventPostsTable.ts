import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventPostsTable1762000000000 implements MigrationInterface {
  name = 'CreateEventPostsTable1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS event_posts (
        id         INT NOT NULL AUTO_INCREMENT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        event_id   INT NOT NULL,
        user_id    INT NOT NULL,
        user_name  VARCHAR(255) NOT NULL,
        content    TEXT NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_event_posts_event_id (event_id),
        CONSTRAINT fk_event_posts_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS event_posts`);
  }
}
