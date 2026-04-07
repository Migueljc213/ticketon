import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'organizers' })
export default class Organizer extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'company_name', length: 255, nullable: false })
  companyName: string;

  @Column({ name: 'cnpj', length: 14, nullable: false, unique: true })
  cnpj: string;

  @Column({ name: 'phone', length: 20, nullable: false })
  phone: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'state', type: 'varchar', length: 2, nullable: true })
  state: string | null;

  @Column({ name: 'zipcode', type: 'varchar', length: 8, nullable: true })
  zipcode: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'website', type: 'text', nullable: true })
  website: string | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
