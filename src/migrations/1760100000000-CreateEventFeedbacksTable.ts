import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventFeedbacksTable1760100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS event_feedbacks (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        event_id         INT NOT NULL,
        purchased_ticket_id INT NULL,
        user_id          INT NULL,
        nps_score        TINYINT NOT NULL,
        sound_rating     TINYINT NULL,
        bathroom_rating  TINYINT NULL,
        bar_wait_rating  TINYINT NULL,
        security_rating  TINYINT NULL,
        open_comment     TEXT NULL,
        created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_event_feedbacks_event_id (event_id),
        INDEX idx_event_feedbacks_ticket_id (purchased_ticket_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS event_feedbacks`);
  }
}
