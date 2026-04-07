import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import EventPost from 'src/events/domain/entity/EventPost.entity';
import IEventPostRepository from 'src/events/domain/interface/event-post.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class EventPostRepository implements IEventPostRepository {
  constructor(
    @InjectRepository(EventPost)
    private readonly repository: Repository<EventPost>,
  ) {}

  async create(input: Partial<EventPost>): Promise<EventPost> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<EventPost | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEventId(eventId: number): Promise<EventPost[]> {
    return this.repository.find({
      where: { eventId, isActive: true, isApproved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<EventPost[]> {
    return this.repository.find({ where: { userId } });
  }

  async findAll(): Promise<EventPost[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<EventPost>): Promise<EventPost> {
    await this.repository.update(id, input);
    const updatedPost = await this.findById(id);
    if (!updatedPost) {
      throw new Error('EventPost not found after update');
    }
    return updatedPost;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

