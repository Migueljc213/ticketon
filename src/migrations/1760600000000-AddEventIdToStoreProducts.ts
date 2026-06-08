import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventIdToStoreProducts1760600000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE store_products
        ADD COLUMN event_id INT NULL DEFAULT NULL AFTER organizer_id,
        ADD INDEX idx_sp_event (event_id),
        ADD CONSTRAINT fk_sp_event FOREIGN KEY (event_id)
          REFERENCES events(id) ON DELETE SET NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE store_products
        DROP FOREIGN KEY fk_sp_event,
        DROP INDEX idx_sp_event,
        DROP COLUMN event_id
    `);
  }
}
