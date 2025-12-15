import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'events' })
export default class Event extends BaseEntity {
  @Column({ name: 'organizer_id', nullable: false })
  organizerId: number;

  @Column({ name: 'title', length: 255, nullable: false })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: false })
  description: string;

  @Column({ name: 'category', length: 100, nullable: false })
  category: string;

  @Column({ name: 'event_date', type: 'datetime', nullable: false })
  eventDate: Date;

  @Column({ name: 'event_end_date', type: 'datetime', nullable: true })
  eventEndDate: Date;

  @Column({ name: 'location_type', length: 20, nullable: false })
  locationType: string;

  @Column({ name: 'venue_name', length: 255, nullable: true })
  venueName: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'city', length: 100, nullable: true })
  city: string;

  @Column({ name: 'state', length: 2, nullable: true })
  state: string;

  @Column({ name: 'zipcode', length: 8, nullable: true })
  zipcode: string;

  @Column({ name: 'online_url', type: 'text', nullable: true })
  onlineUrl: string;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl: string;

  @Column({ name: 'max_attendees', type: 'int', nullable: true })
  maxAttendees: number;

  @Column({ name: 'status', length: 20, nullable: false, default: 'draft' })
  status: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date;
}
