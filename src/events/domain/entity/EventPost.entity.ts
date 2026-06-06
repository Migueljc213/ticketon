import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'event_posts' })
export default class EventPost extends BaseEntity {
  @Column({ name: 'event_id', nullable: false })
  eventId: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'order_id', type: 'int', nullable: true })
  orderId: number | null;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Column({ name: 'is_approved', default: true })
  isApproved: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

