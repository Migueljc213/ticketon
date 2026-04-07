import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { OrderStatus } from '../order-status.enum';

@Entity({ name: 'orders' })
export default class Order extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'event_id', nullable: false })
  eventId: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ name: 'status', length: 20, nullable: false, default: OrderStatus.PENDING })
  status: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'payment_id', type: 'varchar', length: 255, nullable: true })
  paymentId: string | null;

  @Column({ name: 'customer_name', length: 255, nullable: false })
  customerName: string;

  @Column({ name: 'customer_email', length: 255, nullable: false })
  customerEmail: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20, nullable: true })
  customerPhone: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}

