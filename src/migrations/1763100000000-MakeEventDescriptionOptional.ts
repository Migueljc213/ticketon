import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeEventDescriptionOptional1763100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events MODIFY COLUMN description TEXT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events MODIFY COLUMN description TEXT NOT NULL`,
    );
  }
}
