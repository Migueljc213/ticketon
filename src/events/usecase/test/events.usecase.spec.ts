import FakeEventRepository from 'src/events/external/repository/fakes/fake.event.repository';
import CreateEventUseCase from '../create.event.usecase';
import FindEventByIdUseCase from '../find.event.by.id.usecase';
import FindAllEventsUseCase from '../find.all.events.usecase';
import UpdateEventUseCase from '../update.event.usecase';
import DeleteEventUseCase from '../delete.event.usecase';
import CreateEventUseCaseInput from '../dto/input/create.event.usecase.input';
import FindEventByIdUseCaseInput from '../dto/input/find.event.by.id.usecase.input';
import DeleteEventUseCaseInput from '../dto/input/delete.event.usecase.input';

const makeEventInput = (overrides: Partial<CreateEventUseCaseInput> = {}): CreateEventUseCaseInput =>
  new CreateEventUseCaseInput({
    organizerId: 1,
    title: 'Festival de Música',
    description: 'Um ótimo festival',
    category: 'music',
    eventDate: new Date('2030-06-01T20:00:00Z'),
    eventEndDate: null,
    locationType: 'presential',
    venueName: 'Allianz Parque',
    address: 'Av. Francisco Matarazzo, 1705',
    city: 'São Paulo',
    state: 'SP',
    zipcode: '05001200',
    onlineUrl: null,
    bannerUrl: null,
    maxAttendees: 500,
    isPublic: true,
    isPublished: false,
    ...overrides,
  } as any);

describe('Event Use Cases', () => {
  let fakeRepo: FakeEventRepository;

  beforeEach(() => {
    fakeRepo = new FakeEventRepository();
  });

  // ─── CREATE ──────────────────────────────────────────────────────────────────

  describe('CreateEventUseCase', () => {
    it('should create an event and return it with an id', async () => {
      const useCase = new CreateEventUseCase(fakeRepo);
      const result = await useCase.run(makeEventInput());

      expect(result.id).toBe(1);
      expect(result.title).toBe('Festival de Música');
      expect(result.category).toBe('music');
      expect(result.status).toBe('draft');
      expect(result.isPublished).toBe(false);
    });

    it('should auto-increment ids for multiple events', async () => {
      const useCase = new CreateEventUseCase(fakeRepo);
      const a = await useCase.run(makeEventInput({ title: 'Evento A' }));
      const b = await useCase.run(makeEventInput({ title: 'Evento B' }));

      expect(a.id).toBe(1);
      expect(b.id).toBe(2);
    });

    it('should create an online event without venue info', async () => {
      const useCase = new CreateEventUseCase(fakeRepo);
      const result = await useCase.run(makeEventInput({
        locationType: 'online',
        venueName: null,
        address: null,
        onlineUrl: 'https://meet.google.com/demo',
      }));

      expect(result.locationType).toBe('online');
      expect(result.onlineUrl).toBe('https://meet.google.com/demo');
      expect(result.venueName).toBeNull();
    });
  });

  // ─── FIND BY ID ──────────────────────────────────────────────────────────────

  describe('FindEventByIdUseCase', () => {
    it('should return event when found', async () => {
      const createUC = new CreateEventUseCase(fakeRepo);
      const findUC = new FindEventByIdUseCase(fakeRepo);

      await createUC.run(makeEventInput({ title: 'Conferência Tech' }));
      const result = await findUC.run(new FindEventByIdUseCaseInput(1));

      expect(result.title).toBe('Conferência Tech');
      expect(result.id).toBe(1);
    });

    it('should throw when event not found', async () => {
      const useCase = new FindEventByIdUseCase(fakeRepo);
      await expect(useCase.run(new FindEventByIdUseCaseInput(999))).rejects.toThrow('Event not found');
    });
  });

  // ─── FIND ALL ────────────────────────────────────────────────────────────────

  describe('FindAllEventsUseCase', () => {
    it('should return empty list when no events', async () => {
      const useCase = new FindAllEventsUseCase(fakeRepo);
      const result = await useCase.run();
      expect(result.events).toHaveLength(0);
    });

    it('should return all created events', async () => {
      const createUC = new CreateEventUseCase(fakeRepo);
      const findAllUC = new FindAllEventsUseCase(fakeRepo);

      await createUC.run(makeEventInput({ title: 'Evento 1' }));
      await createUC.run(makeEventInput({ title: 'Evento 2' }));
      await createUC.run(makeEventInput({ title: 'Evento 3' }));

      const result = await findAllUC.run();
      expect(result.events).toHaveLength(3);
    });
  });

  // ─── UPDATE ──────────────────────────────────────────────────────────────────

  describe('UpdateEventUseCase', () => {
    it('should update event title', async () => {
      const createUC = new CreateEventUseCase(fakeRepo);
      const updateUC = new UpdateEventUseCase(fakeRepo);

      await createUC.run(makeEventInput());
      const result = await updateUC.run({ id: 1, title: 'Novo Título' } as any);

      expect(result.title).toBe('Novo Título');
    });

    it('should set publishedAt when publishing for the first time', async () => {
      const createUC = new CreateEventUseCase(fakeRepo);
      const updateUC = new UpdateEventUseCase(fakeRepo);

      await createUC.run(makeEventInput({ isPublished: false }));
      const result = await updateUC.run({ id: 1, isPublished: true, status: 'published' } as any);

      expect(result.isPublished).toBe(true);
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw when updating non-existent event', async () => {
      const useCase = new UpdateEventUseCase(fakeRepo);
      await expect(useCase.run({ id: 999, title: 'X' } as any)).rejects.toThrow('Event not found');
    });
  });

  // ─── DELETE ──────────────────────────────────────────────────────────────────

  describe('DeleteEventUseCase', () => {
    it('should delete an existing event', async () => {
      const createUC = new CreateEventUseCase(fakeRepo);
      const deleteUC = new DeleteEventUseCase(fakeRepo);
      const findAllUC = new FindAllEventsUseCase(fakeRepo);

      await createUC.run(makeEventInput());
      await deleteUC.run(new DeleteEventUseCaseInput(1));

      const result = await findAllUC.run();
      expect(result.events).toHaveLength(0);
    });

    it('should throw when deleting non-existent event', async () => {
      const useCase = new DeleteEventUseCase(fakeRepo);
      await expect(useCase.run(new DeleteEventUseCaseInput(999))).rejects.toThrow('Event not found');
    });
  });
});
