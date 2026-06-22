import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export type UserRole = 'participant' | 'organizer' | 'admin';

@Entity({ name: 'users' })
export default class User extends BaseEntity {
  @Column({ name: 'name', length: '255', nullable: false })
  name: string;

  @Column({ name: 'email', length: '255', nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', length: '255', nullable: true })
  password: string | null;

  @Column({ name: 'cpf_cnpj', length: '255', nullable: true })
  cpfCnpj: string | null;

  @Column({ name: 'role', length: 20, nullable: false, default: 'participant' })
  role: UserRole;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;
}
