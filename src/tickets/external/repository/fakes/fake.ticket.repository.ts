import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import ITicketRepository from 'src/tickets/domain/interface/ticket.repository.interface';

export default class FakeTicketRepository implements ITicketRepository {
  private tickets: Ticket[] = [];
  private nextId = 1;

  async create(input: Partial<Ticket>): Promise<Ticket> {
    const ticket = new Ticket();

    ticket.id = this.nextId++;
    ticket.eventId = input.eventId!;
    ticket.name = input.name!;
    ticket.description = input.description || null;
    ticket.price = input.price!;
    ticket.quantityAvailable = input.quantityAvailable!;
    ticket.quantitySold = input.quantitySold || 0;
    ticket.minPerOrder = input.minPerOrder || 1;
    ticket.maxPerOrder = input.maxPerOrder || 10;
    ticket.saleStartDate = input.saleStartDate || null;
    ticket.saleEndDate = input.saleEndDate || null;
    ticket.ticketType = input.ticketType || 'paid';
    ticket.isActive = input.isActive !== undefined ? input.isActive : true;
    ticket.createdAt = new Date();
    ticket.updatedAt = new Date();

    this.tickets.push(ticket);

    return ticket;
  }

  async findById(id: number): Promise<Ticket | null> {
    const ticket = this.tickets.find((t) => t.id === id);
    return ticket || null;
  }

  async findByEventId(eventId: number): Promise<Ticket[]> {
    return this.tickets.filter((t) => t.eventId === eventId);
  }

  async findAll(): Promise<Ticket[]> {
    return [...this.tickets];
  }

  async update(id: number, input: Partial<Ticket>): Promise<Ticket> {
    const ticketIndex = this.tickets.findIndex((t) => t.id === id);
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }

    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        this.tickets[ticketIndex][key] = input[key];
      }
    });

    this.tickets[ticketIndex].updatedAt = new Date();

    return this.tickets[ticketIndex];
  }

  async delete(id: number): Promise<void> {
    const ticketIndex = this.tickets.findIndex((t) => t.id === id);
    if (ticketIndex !== -1) {
      this.tickets.splice(ticketIndex, 1);
    }
  }
}
