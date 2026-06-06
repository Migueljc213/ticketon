import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Event from 'src/events/domain/entity/Event.entity';
import IEventRepository from 'src/events/domain/interface/event.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class EventRepository implements IEventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  async create(input: Partial<Event>): Promise<Event> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<Event | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByOrganizerId(organizerId: number): Promise<Event[]> {
    return this.repository.find({ where: { organizerId } });
  }

  async findAll(): Promise<Event[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<Event>): Promise<Event> {
    await this.repository.update(id, input);
    const updatedEvent = await this.findById(id);
    if (!updatedEvent) {
      throw new Error('Event not found after update');
    }
    return updatedEvent;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
