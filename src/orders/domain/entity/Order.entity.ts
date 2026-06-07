import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import OrderItem from './OrderItem.entity';
import { OrderStatus } from '../order-status.enum';

@Entity({ name: 'orders' })
export default class Order extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'event_id', nullable: false })
  eventId: number;

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

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string | null;

  @Column({
    name: 'mp_preference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mpPreferenceId: string | null;

  @Column({
    name: 'mp_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mpPaymentId: string | null;

  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerName: string | null;

  @Column({
    name: 'customer_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerEmail: string | null;

  @Column({
    name: 'customer_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  customerPhone: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'customer_gender', type: 'varchar', length: 30, nullable: true })
  customerGender: string | null;

  @Column({ name: 'customer_age', type: 'int', nullable: true })
  customerAge: number | null;

  @Column({ name: 'customer_neighborhood', type: 'varchar', length: 100, nullable: true })
  customerNeighborhood: string | null;

  @Column({ name: 'expires_at', type: 'datetime', nullable: false })
  expiresAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];
}
