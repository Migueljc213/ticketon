import { Column, Entity } from 'typeorm';
import BaseEntity from 'src/common/entities/base.entity';

@Entity('event_posts')
export default class EventPost extends BaseEntity {
  @Column({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'user_name', length: 255 })
  userName: string;

  @Column({ type: 'text' })
  content: string;
}
