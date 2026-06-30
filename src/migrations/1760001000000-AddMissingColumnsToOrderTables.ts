import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumnsToOrderTables1760001000000 implements MigrationInterface {
  name = 'AddMissingColumnsToOrderTables1760001000000';

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const [row] = await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    return Number(row.cnt) > 0;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── orders: colunas que existem na entidade mas não na migration original ──
    const orderColumns: [string, string][] = [
      ['event_id',              'INT NOT NULL DEFAULT 0'],
      ['payment_method',        'VARCHAR(50) NULL'],
      ['customer_name',         'VARCHAR(255) NULL'],
      ['customer_email',        'VARCHAR(255) NULL'],
      ['customer_phone',        'VARCHAR(50) NULL'],
      ['notes',                 'TEXT NULL'],
      ['customer_gender',       'VARCHAR(30) NULL'],
      ['customer_age',          'INT NULL'],
      ['customer_neighborhood', 'VARCHAR(100) NULL'],
    ];

    for (const [col, def] of orderColumns) {
      if (!(await this.columnExists(queryRunner, 'orders', col))) {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD COLUMN \`${col}\` ${def}`);
      }
    }

    // ── order_items: colunas que existem na entidade mas não na migration original ──
    const itemColumns: [string, string][] = [
      ['total_price',   'DECIMAL(10,2) NOT NULL DEFAULT 0'],
      ['qr_code',       'VARCHAR(255) NULL'],
      ['qr_code_data',  'TEXT NULL'],
      ['is_used',       'TINYINT(1) NOT NULL DEFAULT 0'],
      ['used_at',       'DATETIME NULL'],
      ['checked_in_by', 'VARCHAR(255) NULL'],
    ];

    for (const [col, def] of itemColumns) {
      if (!(await this.columnExists(queryRunner, 'order_items', col))) {
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD COLUMN \`${col}\` ${def}`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const orderCols = [
      'event_id', 'payment_method', 'customer_name', 'customer_email',
      'customer_phone', 'notes', 'customer_gender', 'customer_age', 'customer_neighborhood',
    ];
    for (const col of orderCols) {
      if (await this.columnExists(queryRunner, 'orders', col)) {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`${col}\``);
      }
    }

    const itemCols = ['total_price', 'qr_code', 'qr_code_data', 'is_used', 'used_at', 'checked_in_by'];
    for (const col of itemCols) {
      if (await this.columnExists(queryRunner, 'order_items', col)) {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`${col}\``);
      }
    }
  }
}
