import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum ConsumptionCategory {
  BEBIDA = 'bebida',
  COMIDA = 'comida',
  OUTRO = 'outro',
}

@Entity({ name: 'event_consumption_records' })
export default class EventConsumptionRecord extends BaseEntity {
  @Column({ name: 'event_id', nullable: false })
  eventId: number;

  @Column({ name: 'item_name', type: 'varchar', length: 100 })
  itemName: string;

  @Column({ name: 'category', type: 'varchar', length: 20, default: ConsumptionCategory.OUTRO })
  category: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'sold_at', type: 'datetime', nullable: true })
  soldAt: Date | null;
}
