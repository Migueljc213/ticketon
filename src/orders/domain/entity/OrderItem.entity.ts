import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'order_items' })
export default class OrderItem extends BaseEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: number;

  @Column({ name: 'ticket_id', nullable: false })
  ticketId: number;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalPrice: number;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData: string | null;

  @Column({ name: 'is_used', default: false })
  isUsed: boolean;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date | null;

  @Column({ name: 'checked_in_by', type: 'int', nullable: true })
  checkedInBy: number | null;
}

