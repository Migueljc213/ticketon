import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import Order from './Order.entity';

@Entity({ name: 'order_items' })
export default class OrderItem extends BaseEntity {
  @Column({ name: 'order_id', nullable: false })
  orderId: number;

  @Column({ name: 'ticket_id', nullable: false })
  ticketId: number;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  unitPrice: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
