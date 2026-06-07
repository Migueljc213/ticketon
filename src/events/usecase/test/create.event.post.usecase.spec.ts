import CreateEventPostUseCase from '../create.event.post.usecase';
import FakeEventPostRepository from 'src/events/external/repository/fakes/fake.event-post.repository';
import FakeEventRepository from 'src/events/external/repository/fakes/fake.event.repository';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import Event from 'src/events/domain/entity/Event.entity';
import Order from 'src/orders/domain/entity/Order.entity';
import { OrderStatus } from 'src/orders/domain/order-status.enum';

describe('CreateEventPostUseCase', () => {
  let createEventPostUseCase: CreateEventPostUseCase;
  let fakeEventPostRepository: FakeEventPostRepository;
  let fakeEventRepository: FakeEventRepository;
  let fakeOrderRepository: FakeOrderRepository;

  beforeEach(() => {
    fakeEventPostRepository = new FakeEventPostRepository();
    fakeEventRepository = new FakeEventRepository();
    fakeOrderRepository = new FakeOrderRepository();
    createEventPostUseCase = new CreateEventPostUseCase(
      fakeEventPostRepository,
      fakeEventRepository,
      fakeOrderRepository,
    );
  });

  it('should create an event post successfully', async () => {
    const event = new Event();
    event.id = 1;
    event.organizerId = 1;
    event.title = 'Test Event';
    event.description = 'Test';
    event.category = 'Music';
    event.eventDate = new Date();
    event.locationType = 'physical';
    await fakeEventRepository.create(event);

    const input = {
      eventId: 1,
      userId: 1,
      content: 'Great event!',
    };

    const result = await createEventPostUseCase.run(input);

    expect(result).toBeDefined();
    expect(result.eventId).toBe(1);
    expect(result.userId).toBe(1);
    expect(result.content).toBe('Great event!');
    expect(result.isApproved).toBe(true);
  });

  it('should validate order when orderId is provided', async () => {
    const event = new Event();
    event.id = 1;
    event.organizerId = 1;
    event.title = 'Test Event';
    event.description = 'Test';
    event.category = 'Music';
    event.eventDate = new Date();
    event.locationType = 'physical';
    await fakeEventRepository.create(event);

    const order = new Order();
    order.id = 1;
    order.userId = 1;
    order.eventId = 1;
    order.totalAmount = 100;
    order.status = OrderStatus.PAID;
    order.customerName = 'John Doe';
    order.customerEmail = 'john@example.com';
    await fakeOrderRepository.create(order);

    const input = {
      eventId: 1,
      userId: 1,
      orderId: 1,
      content: 'Great event!',
    };

    const result = await createEventPostUseCase.run(input);

    expect(result).toBeDefined();
    expect(result.orderId).toBe(1);
  });

  it('should throw error when event does not exist', async () => {
    const input = {
      eventId: 999,
      userId: 1,
      content: 'Great event!',
    };

    await expect(createEventPostUseCase.run(input as any)).rejects.toThrow(
      'Event not found',
    );
  });

  it('should throw error when order does not exist', async () => {
    const event = new Event();
    event.id = 1;
    event.organizerId = 1;
    event.title = 'Test Event';
    event.description = 'Test';
    event.category = 'Music';
    event.eventDate = new Date();
    event.locationType = 'physical';
    await fakeEventRepository.create(event);

    const input = {
      eventId: 1,
      userId: 1,
      orderId: 999,
      content: 'Great event!',
    };

    await expect(createEventPostUseCase.run(input as any)).rejects.toThrow(
      'Order not found',
    );
  });

  it('should throw error when order does not belong to user', async () => {
    const event = new Event();
    event.id = 1;
    event.organizerId = 1;
    event.title = 'Test Event';
    event.description = 'Test';
    event.category = 'Music';
    event.eventDate = new Date();
    event.locationType = 'physical';
    await fakeEventRepository.create(event);

    const order = new Order();
    order.id = 1;
    order.userId = 2;
    order.eventId = 1;
    order.totalAmount = 100;
    order.status = OrderStatus.PAID;
    order.customerName = 'John Doe';
    order.customerEmail = 'john@example.com';
    await fakeOrderRepository.create(order);

    const input = {
      eventId: 1,
      userId: 1,
      orderId: 1,
      content: 'Great event!',
    };

    await expect(createEventPostUseCase.run(input as any)).rejects.toThrow(
      'Order does not belong to user',
    );
  });

  it('should throw error when order is not paid', async () => {
    const event = new Event();
    event.id = 1;
    event.organizerId = 1;
    event.title = 'Test Event';
    event.description = 'Test';
    event.category = 'Music';
    event.eventDate = new Date();
    event.locationType = 'physical';
    await fakeEventRepository.create(event);

    const order = new Order();
    order.id = 1;
    order.userId = 1;
    order.eventId = 1;
    order.totalAmount = 100;
    order.status = OrderStatus.PENDING;
    order.customerName = 'John Doe';
    order.customerEmail = 'john@example.com';
    await fakeOrderRepository.create(order);

    const input = {
      eventId: 1,
      userId: 1,
      orderId: 1,
      content: 'Great event!',
    };

    await expect(createEventPostUseCase.run(input as any)).rejects.toThrow(
      'Order is not paid',
    );
  });
});
