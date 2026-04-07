import FindTicketsByEventIdUseCase from '../find.tickets.by.event.id.usecase';
import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';

describe('FindTicketsByEventIdUseCase', () => {
  let findTicketsByEventIdUseCase: FindTicketsByEventIdUseCase;
  let fakeTicketRepository: FakeTicketRepository;

  beforeEach(() => {
    fakeTicketRepository = new FakeTicketRepository();
    findTicketsByEventIdUseCase = new FindTicketsByEventIdUseCase(
      fakeTicketRepository,
    );
  });

  it('should return tickets for an event', async () => {
    const ticket1 = new Ticket();
    ticket1.id = 1;
    ticket1.eventId = 1;
    ticket1.name = 'VIP';
    ticket1.price = 100;
    ticket1.quantityAvailable = 10;
    ticket1.quantitySold = 0;
    await fakeTicketRepository.create(ticket1);

    const ticket2 = new Ticket();
    ticket2.id = 2;
    ticket2.eventId = 1;
    ticket2.name = 'Pista';
    ticket2.price = 50;
    ticket2.quantityAvailable = 20;
    ticket2.quantitySold = 0;
    await fakeTicketRepository.create(ticket2);

    const ticket3 = new Ticket();
    ticket3.id = 3;
    ticket3.eventId = 2;
    ticket3.name = 'VIP';
    ticket3.price = 150;
    ticket3.quantityAvailable = 5;
    ticket3.quantitySold = 0;
    await fakeTicketRepository.create(ticket3);

    const result = await findTicketsByEventIdUseCase.run({ eventId: 1 } as any);

    expect(result.tickets).toHaveLength(2);
    expect(result.tickets[0].eventId).toBe(1);
    expect(result.tickets[1].eventId).toBe(1);
    expect(result.tickets.find((t) => t.name === 'VIP')).toBeDefined();
    expect(result.tickets.find((t) => t.name === 'Pista')).toBeDefined();
  });

  it('should return empty array when no tickets exist for event', async () => {
    const result = await findTicketsByEventIdUseCase.run({ eventId: 999 } as any);

    expect(result.tickets).toHaveLength(0);
  });

  it('should only return tickets for specified event', async () => {
    const ticket1 = new Ticket();
    ticket1.id = 1;
    ticket1.eventId = 1;
    ticket1.name = 'VIP';
    ticket1.price = 100;
    ticket1.quantityAvailable = 10;
    ticket1.quantitySold = 0;
    await fakeTicketRepository.create(ticket1);

    const ticket2 = new Ticket();
    ticket2.id = 2;
    ticket2.eventId = 2;
    ticket2.name = 'Pista';
    ticket2.price = 50;
    ticket2.quantityAvailable = 20;
    ticket2.quantitySold = 0;
    await fakeTicketRepository.create(ticket2);

    const result = await findTicketsByEventIdUseCase.run({ eventId: 1 } as any);

    expect(result.tickets).toHaveLength(1);
    expect(result.tickets[0].eventId).toBe(1);
    expect(result.tickets[0].name).toBe('VIP');
  });
});

