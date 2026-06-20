import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoverUrlAndPostMedia1760600000000 implements MigrationInterface {
  name = 'AddCoverUrlAndPostMedia1760600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`organizers\` ADD \`cover_url\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` ADD \`image_url\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` ADD \`link_url\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` ADD \`link_title\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` DROP COLUMN \`link_title\``);
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` DROP COLUMN \`link_url\``);
    await queryRunner.query(`ALTER TABLE \`organizer_posts\` DROP COLUMN \`image_url\``);
    await queryRunner.query(`ALTER TABLE \`organizers\` DROP COLUMN \`cover_url\``);
  }
}
