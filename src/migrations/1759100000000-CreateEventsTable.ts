import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1759100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        organizer_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        event_date DATETIME NOT NULL,
        event_end_date DATETIME NULL,
        location_type VARCHAR(20) NOT NULL,
        venue_name VARCHAR(255) NULL,
        address TEXT NULL,
        city VARCHAR(100) NULL,
        state VARCHAR(2) NULL,
        zipcode VARCHAR(8) NULL,
        online_url TEXT NULL,
        banner_url TEXT NULL,
        max_attendees INT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        is_public BOOLEAN NOT NULL DEFAULT TRUE,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        published_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS events`);
  }
}
