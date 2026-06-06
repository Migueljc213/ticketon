import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import IEventPostRepository from '../../domain/interface/event-post.repository.interface';
import EventPost from '../../domain/entity/EventPost.entity';

@Injectable()
export default class EventPostRepository implements IEventPostRepository {
  constructor(
    @InjectRepository(EventPost)
    private readonly repo: Repository<EventPost>,
  ) {}

  create(input: Partial<EventPost>): Promise<EventPost> {
    return this.repo.save(input);
  }

  findByEventId(eventId: number): Promise<EventPost[]> {
    return this.repo.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }
}
