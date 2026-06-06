import Ticket from 'src/tickets/domain/entity/Ticket.entity';

export default class FindAllTicketsUseCaseOutput {
  tickets: Ticket[];

  constructor(tickets: Ticket[]) {
    this.tickets = tickets;
  }
}
