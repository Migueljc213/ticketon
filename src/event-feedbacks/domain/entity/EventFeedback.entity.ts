import BaseEntity from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'event_feedbacks' })
export default class EventFeedback extends BaseEntity {
  @Column({ name: 'event_id', nullable: false })
  eventId: number;

  @Column({ name: 'purchased_ticket_id', type: 'int', nullable: true })
  purchasedTicketId: number | null;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  /** NPS: 0–10 */
  @Column({ name: 'nps_score', type: 'tinyint', nullable: false })
  npsScore: number;

  /** Qualidade do som: 1–5 */
  @Column({ name: 'sound_rating', type: 'tinyint', nullable: true })
  soundRating: number | null;

  /** Limpeza dos banheiros: 1–5 */
  @Column({ name: 'bathroom_rating', type: 'tinyint', nullable: true })
  bathroomRating: number | null;

  /** Tempo de fila no bar: 1–5 */
  @Column({ name: 'bar_wait_rating', type: 'tinyint', nullable: true })
  barWaitRating: number | null;

  /** Segurança: 1–5 */
  @Column({ name: 'security_rating', type: 'tinyint', nullable: true })
  securityRating: number | null;

  @Column({ name: 'open_comment', type: 'text', nullable: true })
  openComment: string | null;
}
