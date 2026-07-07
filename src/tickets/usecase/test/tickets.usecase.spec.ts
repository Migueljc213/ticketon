import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import CreateTicketUseCase from '../create.ticket.usecase';
import FindTicketsByEventIdUseCase from '../find.tickets.by.event.id.usecase';
import UpdateTicketUseCase from '../update.ticket.usecase';
import DeleteTicketUseCase from '../delete.ticket.usecase';
import CreateTicketUseCaseInput from '../dto/input/create.ticket.usecase.input';
import DeleteTicketUseCaseInput from '../dto/input/delete.ticket.usecase.input';

const makeTicketInput = (overrides: Partial<CreateTicketUseCaseInput> = {}): CreateTicketUseCaseInput =>
  new CreateTicketUseCaseInput({
    eventId: 10,
    name: 'Ingresso Pista',
    description: 'Acesso à área pista',
    price: 120.00,
    quantityAvailable: 200,
    minPerOrder: 1,
    maxPerOrder: 4,
    ticketType: 'paid',
    isActive: true,
    ...overrides,
  } as any);

const fakeEventRepo = {
  findById: async (id: number) => ({
    id,
    maxAttendees: null,
    eventDate: new Date('2030-01-01T00:00:00'),
    eventEndDate: null,
  }),
} as any;

describe('Ticket Use Cases', () => {
  let fakeRepo: FakeTicketRepository;

  beforeEach(() => {
    fakeRepo = new FakeTicketRepository();
  });

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  describe('CreateTicketUseCase', () => {
    it('should create a ticket and return it with an id', async () => {
      const useCase = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const result = await useCase.run(makeTicketInput());

      expect(result.id).toBe(1);
      expect(result.name).toBe('Ingresso Pista');
      expect(result.price).toBe(120.00);
      expect(result.eventId).toBe(10);
      expect(result.quantitySold).toBe(0);
      expect(result.isActive).toBe(true);
    });

    it('should create a free ticket with price zero', async () => {
      const useCase = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const result = await useCase.run(makeTicketInput({ price: 0, ticketType: 'free' }));

      expect(result.price).toBe(0);
      expect(result.ticketType).toBe('free');
    });

    it('should auto-increment ids for multiple tickets', async () => {
      const useCase = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const a = await useCase.run(makeTicketInput({ name: 'Pista' }));
      const b = await useCase.run(makeTicketInput({ name: 'VIP' }));

      expect(a.id).toBe(1);
      expect(b.id).toBe(2);
    });

    it('should create multiple tickets for the same event', async () => {
      const useCase = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const findUC = new FindTicketsByEventIdUseCase(fakeRepo);

      await useCase.run(makeTicketInput({ name: 'Pista' }));
      await useCase.run(makeTicketInput({ name: 'Camarote' }));

      const result = await findUC.run({ eventId: 10 });
      expect(result.tickets).toHaveLength(2);
    });
  });

  // ─── FIND BY EVENT ID ────────────────────────────────────────────────────────

  describe('FindTicketsByEventIdUseCase', () => {
    it('should return empty list when event has no tickets', async () => {
      const useCase = new FindTicketsByEventIdUseCase(fakeRepo);
      const result = await useCase.run({ eventId: 99 });
      expect(result.tickets).toHaveLength(0);
    });

    it('should only return tickets for the requested event', async () => {
      const createUC = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const findUC = new FindTicketsByEventIdUseCase(fakeRepo);

      await createUC.run(makeTicketInput({ eventId: 10, name: 'Evento 10 - Pista' }));
      await createUC.run(makeTicketInput({ eventId: 20, name: 'Evento 20 - VIP' }));

      const result = await findUC.run({ eventId: 10 });
      expect(result.tickets).toHaveLength(1);
      expect(result.tickets[0].name).toBe('Evento 10 - Pista');
    });
  });

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  describe('UpdateTicketUseCase', () => {
    it('should update ticket name and price', async () => {
      const createUC = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const updateUC = new UpdateTicketUseCase(fakeRepo);

      await createUC.run(makeTicketInput());
      const result = await updateUC.run({ id: 1, name: 'VIP Premium', price: 350 } as any);

      expect(result.name).toBe('VIP Premium');
      expect(result.price).toBe(350);
    });

    it('should deactivate a ticket', async () => {
      const createUC = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const updateUC = new UpdateTicketUseCase(fakeRepo);

      await createUC.run(makeTicketInput({ isActive: true }));
      const result = await updateUC.run({ id: 1, isActive: false } as any);

      expect(result.isActive).toBe(false);
    });

    it('should throw when updating non-existent ticket', async () => {
      const useCase = new UpdateTicketUseCase(fakeRepo);
      await expect(useCase.run({ id: 999, name: 'X' } as any)).rejects.toThrow('Ticket not found');
    });
  });

  // ─── DELETE ──────────────────────────────────────────────────────────────────

  describe('DeleteTicketUseCase', () => {
    it('should delete an existing ticket', async () => {
      const createUC = new CreateTicketUseCase(fakeRepo, fakeEventRepo);
      const deleteUC = new DeleteTicketUseCase(fakeRepo);
      const findUC = new FindTicketsByEventIdUseCase(fakeRepo);

      await createUC.run(makeTicketInput());
      await deleteUC.run(new DeleteTicketUseCaseInput(1));

      const result = await findUC.run({ eventId: 10 });
      expect(result.tickets).toHaveLength(0);
    });

    it('should throw when deleting non-existent ticket', async () => {
      const useCase = new DeleteTicketUseCase(fakeRepo);
      await expect(useCase.run(new DeleteTicketUseCaseInput(999))).rejects.toThrow('Ticket not found');
    });
  });
});
