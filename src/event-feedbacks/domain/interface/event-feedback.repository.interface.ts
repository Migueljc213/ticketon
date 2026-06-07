import EventFeedback from '../entity/EventFeedback.entity';

export interface CreateFeedbackInput {
  eventId: number;
  purchasedTicketId?: number;
  userId?: number;
  npsScore: number;
  soundRating?: number;
  bathroomRating?: number;
  barWaitRating?: number;
  securityRating?: number;
  openComment?: string;
}

export interface FeedbackSummary {
  totalFeedbacks: number;
  avgNps: number;
  npsScore: number; // NPS calculado = % promotores - % detratores
  promoters: number;
  passives: number;
  detractors: number;
  avgSound: number | null;
  avgBathroom: number | null;
  avgBarWait: number | null;
  avgSecurity: number | null;
  recentComments: Array<{ comment: string; npsScore: number; createdAt: Date }>;
}

export default interface IEventFeedbackRepository {
  create(input: CreateFeedbackInput): Promise<EventFeedback>;
  findByEventId(eventId: number): Promise<EventFeedback[]>;
  getSummary(eventId: number): Promise<FeedbackSummary>;
  hasSubmitted(eventId: number, purchasedTicketId: number): Promise<boolean>;
}
