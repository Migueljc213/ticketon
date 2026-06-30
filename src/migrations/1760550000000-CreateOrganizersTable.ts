import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrganizersTable1760550000000 implements MigrationInterface {
  name = 'CreateOrganizersTable1760550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS organizers (
        id           INT NOT NULL AUTO_INCREMENT,
        created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id      INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        cnpj         VARCHAR(14) NOT NULL,
        phone        VARCHAR(20) NOT NULL,
        address      TEXT NULL,
        city         VARCHAR(100) NULL,
        state        VARCHAR(2) NULL,
        zipcode      VARCHAR(8) NULL,
        description  TEXT NULL,
        logo_url     TEXT NULL,
        website      TEXT NULL,
        is_verified  TINYINT(1) NOT NULL DEFAULT 0,
        is_active    TINYINT(1) NOT NULL DEFAULT 1,
        PRIMARY KEY (id),
        UNIQUE KEY uq_organizers_cnpj (cnpj),
        INDEX idx_organizers_user_id (user_id),
        CONSTRAINT fk_organizers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS organizers`);
  }
}
