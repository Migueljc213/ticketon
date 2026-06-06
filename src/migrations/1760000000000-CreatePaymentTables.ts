import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentTables1760000000000 implements MigrationInterface {
  name = 'CreatePaymentTables1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // orders
    await queryRunner.query(`
      CREATE TABLE \`orders\` (
        \`id\`              INT NOT NULL AUTO_INCREMENT,
        \`created_at\`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`user_id\`         INT NOT NULL,
        \`status\`          VARCHAR(20) NOT NULL DEFAULT 'pending_payment',
        \`total_amount\`    DECIMAL(10,2) NOT NULL,
        \`mp_preference_id\` VARCHAR(255) NULL,
        \`mp_payment_id\`   VARCHAR(255) NULL,
        \`expires_at\`      DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_orders_user_id\` (\`user_id\`),
        INDEX \`IDX_orders_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // order_items
    await queryRunner.query(`
      CREATE TABLE \`order_items\` (
        \`id\`          INT NOT NULL AUTO_INCREMENT,
        \`created_at\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`order_id\`    INT NOT NULL,
        \`ticket_id\`   INT NOT NULL,
        \`quantity\`    INT NOT NULL,
        \`unit_price\`  DECIMAL(10,2) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_order_items_order_id\` (\`order_id\`),
        CONSTRAINT \`FK_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // payments
    await queryRunner.query(`
      CREATE TABLE \`payments\` (
        \`id\`              INT NOT NULL AUTO_INCREMENT,
        \`created_at\`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`order_id\`        INT NOT NULL,
        \`mp_payment_id\`   VARCHAR(255) NULL,
        \`status\`          VARCHAR(20) NOT NULL DEFAULT 'pending',
        \`payment_method\`  VARCHAR(50) NULL,
        \`amount\`          DECIMAL(10,2) NOT NULL,
        \`raw_response\`    JSON NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_payments_order_id\` (\`order_id\`),
        CONSTRAINT \`FK_payments_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // purchased_tickets
    await queryRunner.query(`
      CREATE TABLE \`purchased_tickets\` (
        \`id\`          INT NOT NULL AUTO_INCREMENT,
        \`created_at\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`order_id\`    INT NOT NULL,
        \`ticket_id\`   INT NOT NULL,
        \`user_id\`     INT NOT NULL,
        \`qr_code\`     VARCHAR(100) NOT NULL,
        \`status\`      VARCHAR(20) NOT NULL DEFAULT 'valid',
        \`used_at\`     DATETIME NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`UQ_purchased_tickets_qr_code\` (\`qr_code\`),
        INDEX \`IDX_purchased_tickets_user_id\` (\`user_id\`),
        INDEX \`IDX_purchased_tickets_order_id\` (\`order_id\`),
        CONSTRAINT \`FK_purchased_tickets_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`purchased_tickets\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`payments\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`order_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`orders\``);
  }
}
