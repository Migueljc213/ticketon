import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import EventFeedback from '../../domain/entity/EventFeedback.entity';
import type IEventFeedbackRepository from '../../domain/interface/event-feedback.repository.interface';
import type {
  CreateFeedbackInput,
  FeedbackSummary,
} from '../../domain/interface/event-feedback.repository.interface';

@Injectable()
export default class EventFeedbackRepository implements IEventFeedbackRepository {
  constructor(
    @InjectRepository(EventFeedback)
    private readonly repo: Repository<EventFeedback>,
  ) {}

  async create(input: CreateFeedbackInput): Promise<EventFeedback> {
    const fb = this.repo.create({
      eventId: input.eventId,
      purchasedTicketId: input.purchasedTicketId ?? null,
      userId: input.userId ?? null,
      npsScore: input.npsScore,
      soundRating: input.soundRating ?? null,
      bathroomRating: input.bathroomRating ?? null,
      barWaitRating: input.barWaitRating ?? null,
      securityRating: input.securityRating ?? null,
      openComment: input.openComment ?? null,
    });
    return this.repo.save(fb);
  }

  async findByEventId(eventId: number): Promise<EventFeedback[]> {
    return this.repo.find({ where: { eventId }, order: { createdAt: 'DESC' } });
  }

  async hasSubmitted(eventId: number, purchasedTicketId: number): Promise<boolean> {
    const count = await this.repo.count({ where: { eventId, purchasedTicketId } });
    return count > 0;
  }

  async getSummary(eventId: number): Promise<FeedbackSummary> {
    const feedbacks = await this.findByEventId(eventId);
    const total = feedbacks.length;

    if (total === 0) {
      return {
        totalFeedbacks: 0,
        avgNps: 0,
        npsScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        avgSound: null,
        avgBathroom: null,
        avgBarWait: null,
        avgSecurity: null,
        recentComments: [],
      };
    }

    const avg = (arr: number[]) =>
      arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

    const npsValues = feedbacks.map(f => f.npsScore);
    const promoters  = feedbacks.filter(f => f.npsScore >= 9).length;
    const detractors = feedbacks.filter(f => f.npsScore <= 6).length;
    const passives   = total - promoters - detractors;
    const npsScore   = Math.round(((promoters - detractors) / total) * 100);

    const nonNull = <T>(arr: Array<T | null>): T[] =>
      arr.filter((v): v is T => v !== null);

    const recentComments = feedbacks
      .filter(f => f.openComment)
      .slice(0, 10)
      .map(f => ({ comment: f.openComment!, npsScore: f.npsScore, createdAt: f.createdAt }));

    return {
      totalFeedbacks: total,
      avgNps: avg(npsValues) ?? 0,
      npsScore,
      promoters,
      passives,
      detractors,
      avgSound:     avg(nonNull(feedbacks.map(f => f.soundRating))),
      avgBathroom:  avg(nonNull(feedbacks.map(f => f.bathroomRating))),
      avgBarWait:   avg(nonNull(feedbacks.map(f => f.barWaitRating))),
      avgSecurity:  avg(nonNull(feedbacks.map(f => f.securityRating))),
      recentComments,
    };
  }
}
