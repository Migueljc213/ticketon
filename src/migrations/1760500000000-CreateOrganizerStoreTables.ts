import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizerStoreTables1760500000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE store_products (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        organizer_id INT NOT NULL,
        name         VARCHAR(255) NOT NULL,
        description  TEXT NULL,
        price        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock        INT NOT NULL DEFAULT 0,
        image_url    TEXT NULL,
        category     VARCHAR(50) NOT NULL DEFAULT 'other',
        is_active    TINYINT(1) NOT NULL DEFAULT 1,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_sp_organizer (organizer_id),
        INDEX idx_sp_active (organizer_id, is_active),
        CONSTRAINT fk_sp_organizer FOREIGN KEY (organizer_id)
          REFERENCES organizers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE store_orders (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        product_id     INT NOT NULL,
        organizer_id   INT NOT NULL,
        user_id        INT NULL,
        customer_name  VARCHAR(200) NOT NULL,
        customer_email VARCHAR(200) NOT NULL,
        customer_phone VARCHAR(20) NULL,
        quantity       INT NOT NULL DEFAULT 1,
        unit_price     DECIMAL(10,2) NOT NULL,
        total_amount   DECIMAL(10,2) NOT NULL,
        status         ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
        notes          TEXT NULL,
        created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_so_product (product_id),
        INDEX idx_so_organizer (organizer_id),
        INDEX idx_so_user (user_id),
        CONSTRAINT fk_so_product  FOREIGN KEY (product_id)  REFERENCES store_products(id) ON DELETE CASCADE,
        CONSTRAINT fk_so_org      FOREIGN KEY (organizer_id) REFERENCES organizers(id)    ON DELETE CASCADE,
        CONSTRAINT fk_so_user     FOREIGN KEY (user_id)      REFERENCES users(id)         ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE store_orders`);
    await queryRunner.query(`DROP TABLE store_products`);
  }
}
