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
  address: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  @Column({ name: 'state', length: 2, nullable: true })
  state: string;

  @Column({ name: 'zipcode', length: 8, nullable: true })
  zipcode: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'website', type: 'text', nullable: true })
  website: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
