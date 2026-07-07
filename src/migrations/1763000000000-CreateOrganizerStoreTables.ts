import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizerStoreTables1763000000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS store_products (
        id           INT NOT NULL AUTO_INCREMENT,
        organizer_id INT NOT NULL,
        event_id     INT NULL,
        name         VARCHAR(255) NOT NULL,
        description  TEXT NULL,
        price        DECIMAL(10,2) NOT NULL,
        stock        INT NOT NULL DEFAULT 0,
        image_url    TEXT NULL,
        category     VARCHAR(50) NOT NULL DEFAULT 'other',
        is_active    TINYINT NOT NULL DEFAULT 1,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_sp_organizer (organizer_id),
        INDEX idx_sp_event (event_id),
        CONSTRAINT fk_sp_organizer FOREIGN KEY (organizer_id) REFERENCES organizers(id) ON DELETE CASCADE,
        CONSTRAINT fk_sp_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS store_orders (
        id             INT NOT NULL AUTO_INCREMENT,
        product_id     INT NOT NULL,
        customer_name  VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NULL,
        quantity       INT NOT NULL,
        unit_price     DECIMAL(10,2) NOT NULL,
        total_amount   DECIMAL(10,2) NOT NULL,
        status         VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes          TEXT NULL,
        created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_so_product (product_id),
        CONSTRAINT fk_so_product FOREIGN KEY (product_id) REFERENCES store_products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE store_orders`);
    await queryRunner.query(`DROP TABLE store_products`);
  }
}
