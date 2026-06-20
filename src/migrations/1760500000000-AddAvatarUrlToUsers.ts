import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToUsers1760500000000 implements MigrationInterface {
  name = 'AddAvatarUrlToUsers1760500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`avatar_url\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`avatar_url\``,
    );
  }
}
