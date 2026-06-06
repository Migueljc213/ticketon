import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import OrderItem from './OrderItem.entity';

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'expired'
  | 'cancelled'
  | 'refunded';

@Entity({ name: 'orders' })
export default class Order extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'status', length: 20, default: 'pending_payment' })
  status: OrderStatus;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalAmount: number;

  @Column({ name: 'mp_preference_id', type: 'varchar', length: 255, nullable: true })
  mpPreferenceId: string | null;

  @Column({ name: 'mp_payment_id', type: 'varchar', length: 255, nullable: true })
  mpPaymentId: string | null;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];
}
