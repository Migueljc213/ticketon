import Ticket from '../entity/Ticket.entity';

export default interface ITicketRepository {
  create(input: Partial<Ticket>): Promise<Ticket>;
  findById(id: number): Promise<Ticket | null>;
  findByEventId(eventId: number): Promise<Ticket[]>;
  findAll(): Promise<Ticket[]>;
  update(id: number, input: Partial<Ticket>): Promise<Ticket>;
  delete(id: number): Promise<void>;
}
