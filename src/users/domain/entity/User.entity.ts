import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export default class User extends BaseEntity {
  @Column({ name: 'name', length: '255', nullable: false })
  name: string;

  @Column({ name: 'email', length: '255', nullable: false, unique: true })
  email: string;

  @Column({ name: 'password', length: '255', nullable: false })
  password: string;

  @Column({ name: 'cpf_cnpj', length: '255', nullable: false })
  cpfCnpj: string;

  @Column({ name: 'bank_info', nullable: true })
  bankInfo: string;
}
