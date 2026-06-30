import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventConsumptionRecordsTable1762000000001 implements MigrationInterface {
  name = 'CreateEventConsumptionRecordsTable1762000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS event_consumption_records (
        id           INT NOT NULL AUTO_INCREMENT,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        event_id     INT NOT NULL,
        item_name    VARCHAR(100) NOT NULL,
        category     VARCHAR(20) NOT NULL DEFAULT 'outro',
        quantity     INT NOT NULL,
        unit_price   DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        sold_at      DATETIME NULL,
        PRIMARY KEY (id),
        INDEX idx_ecr_event_id (event_id),
        CONSTRAINT fk_ecr_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS event_consumption_records`);
  }
}
