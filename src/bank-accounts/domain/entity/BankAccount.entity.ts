import { Column, Entity, Index } from 'typeorm';
import BaseEntity from 'src/common/entities/base.entity';

export type AccountType = 'corrente' | 'poupanca';

@Entity({ name: 'bank_accounts' })
export default class BankAccount extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'bank_code', length: 10, nullable: false })
  bankCode: string;

  @Column({ name: 'bank_name', length: 100, nullable: false })
  bankName: string;

  @Column({ name: 'agency', length: 20, nullable: false })
  agency: string;

  @Column({ name: 'account_number', length: 30, nullable: false })
  accountNumber: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: ['corrente', 'poupanca'],
    default: 'corrente',
  })
  accountType: AccountType;

  @Column({ name: 'holder_name', length: 255, nullable: false })
  holderName: string;

  @Column({ name: 'holder_cpf_cnpj', length: 20, nullable: false })
  holderCpfCnpj: string;

  @Column({ name: 'pix_key', length: 255, nullable: true })
  pixKey: string | null;
}
