import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import ITicketRepository from 'src/tickets/domain/interface/ticket.repository.interface';
import { Repository } from 'typeorm';

@Injectable()
export default class TicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) {}

  async create(input: Partial<Ticket>): Promise<Ticket> {
    return this.repository.save(input);
  }

  async findById(id: number): Promise<Ticket | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEventId(eventId: number): Promise<Ticket[]> {
    return this.repository.find({ where: { eventId } });
  }

  async findAll(): Promise<Ticket[]> {
    return this.repository.find();
  }

  async update(id: number, input: Partial<Ticket>): Promise<Ticket> {
    await this.repository.update(id, input);
    const updatedTicket = await this.findById(id);
    if (!updatedTicket) {
      throw new Error('Ticket not found after update');
    }
    return updatedTicket;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
