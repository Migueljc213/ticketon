import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

@Entity({ name: 'payments' })
export default class Payment extends BaseEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: number;

  @Column({
    name: 'mp_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mpPaymentId: string | null;

  @Column({ name: 'status', length: 20, default: 'pending' })
  status: PaymentStatus;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  paymentMethod: string | null; // pix | credit_card | bolbradesco

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({ name: 'raw_response', type: 'json', nullable: true })
  rawResponse: object | null;
}
