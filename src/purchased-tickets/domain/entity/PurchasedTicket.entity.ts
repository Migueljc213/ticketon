import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export type PurchasedTicketStatus = 'valid' | 'used' | 'cancelled';

@Entity({ name: 'purchased_tickets' })
export default class PurchasedTicket extends BaseEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: number;

  @Column({ name: 'ticket_id', nullable: false })
  ticketId: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  /** UUID único usado como QR code para validação na entrada */
  @Column({ name: 'qr_code', type: 'varchar', length: 100, unique: true, nullable: false })
  qrCode: string;

  @Column({ name: 'status', length: 20, default: 'valid' })
  status: PurchasedTicketStatus;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt: Date | null;
}
