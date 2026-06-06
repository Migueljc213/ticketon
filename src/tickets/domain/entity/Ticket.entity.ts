import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'tickets' })
export default class Ticket extends BaseEntity {
  @Column({ name: 'event_id', nullable: false })
  eventId: number;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({ name: 'quantity_available', type: 'int', nullable: false })
  quantityAvailable: number;

  @Column({ name: 'quantity_sold', type: 'int', nullable: false, default: 0 })
  quantitySold: number;

  @Column({ name: 'min_per_order', type: 'int', nullable: false, default: 1 })
  minPerOrder: number;

  @Column({ name: 'max_per_order', type: 'int', nullable: false, default: 10 })
  maxPerOrder: number;

  @Column({ name: 'sale_start_date', type: 'datetime', nullable: true })
  saleStartDate: Date | null;

  @Column({ name: 'sale_end_date', type: 'datetime', nullable: true })
  saleEndDate: Date | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'ticket_type', length: 50, nullable: false, default: 'paid' })
  ticketType: string;
}
