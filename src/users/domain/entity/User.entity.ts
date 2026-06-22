import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export type UserRole = 'participant' | 'organizer' | 'admin';

@Entity({ name: 'users' })
export default class User extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ name: 'cpf_cnpj', type: 'varchar', length: 255, nullable: true })
  cpfCnpj: string | null;

  @Column({ name: 'role', length: 20, nullable: false, default: 'participant' })
  role: UserRole;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'gender', type: 'varchar', length: 30, nullable: true })
  gender: string | null;

  @Column({ name: 'age', type: 'int', nullable: true })
  age: number | null;

  @Column({ name: 'neighborhood', type: 'varchar', length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ name: 'bank_info', type: 'text', nullable: true })
  bankInfo: string | null;
}
