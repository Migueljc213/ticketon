import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1759090060488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users 
(            id INT PRIMARY KEY AUTO_INCREMENT ,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            cpf_cnpj VARCHAR(255) NOT NULL UNIQUE,
            bank_info TEXT NULL,
            created_at DATETIME NOT NULL, 
            updated_at DATETIME NOT NULL)
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
