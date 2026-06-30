import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketsTable1759150000000 implements MigrationInterface {
  name = 'CreateTicketsTable1759150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id                  INT NOT NULL AUTO_INCREMENT,
        created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        event_id            INT NOT NULL,
        name                VARCHAR(255) NOT NULL,
        description         TEXT NULL,
        price               DECIMAL(10,2) NOT NULL,
        quantity_available  INT NOT NULL,
        quantity_sold       INT NOT NULL DEFAULT 0,
        min_per_order       INT NOT NULL DEFAULT 1,
        max_per_order       INT NOT NULL DEFAULT 10,
        sale_start_date     DATETIME NULL,
        sale_end_date       DATETIME NULL,
        is_active           TINYINT(1) NOT NULL DEFAULT 1,
        ticket_type         VARCHAR(50) NOT NULL DEFAULT 'paid',
        PRIMARY KEY (id),
        INDEX idx_tickets_event_id (event_id),
        CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tickets`);
  }
}
