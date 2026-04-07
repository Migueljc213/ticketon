import GetParticipantsListUseCase from '../get.participants.list.usecase';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import FakeOrderItemRepository from 'src/orders/external/repository/fakes/fake.order-item.repository';
import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import {
  OrderTestBuilder,
  OrderItemTestBuilder,
  TicketTestBuilder,
} from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('GetParticipantsListUseCase', () => {
  let getParticipantsListUseCase: GetParticipantsListUseCase;
  let fakeOrderRepository: FakeOrderRepository;
  let fakeOrderItemRepository: FakeOrderItemRepository;
  let fakeTicketRepository: FakeTicketRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    fakeOrderItemRepository = new FakeOrderItemRepository();
    fakeTicketRepository = new FakeTicketRepository();
    getParticipantsListUseCase = new GetParticipantsListUseCase(
      fakeOrderRepository,
      fakeOrderItemRepository,
      fakeTicketRepository,
    );
  });

  describe('successful retrieval', () => {
    it('should return participants list for an event with paid orders', async () => {
      // Arrange
      const eventId = TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
      const ticket = new TicketTestBuilder()
        .withEventId(eventId)
        .build();
      await fakeTicketRepository.create(ticket);

      const order = new OrderTestBuilder()
        .withEventId(eventId)
        .asPaid()
        .withTotalAmount(200)
        .build();
      await fakeOrderRepository.create(order);

      const item1 = new OrderItemTestBuilder()
        .withId(1)
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode('QR-CODE-1')
        .asUnused()
        .build();
      await fakeOrderItemRepository.create(item1);

      const item2 = new OrderItemTestBuilder()
        .withId(2)
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode('QR-CODE-2')
        .asUsed()
        .build();
      await fakeOrderItemRepository.create(item2);

      // Act
      const result = await getParticipantsListUseCase.run({ eventId } as any);

      // Assert
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].customerName).toBe(
        TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
      );
      expect(result.participants[0].ticketName).toBe(ticket.name);
      expect(result.participants[0].qrCode).toBe('QR-CODE-1');
      expect(result.participants[0].isCheckedIn).toBe(false);
      expect(result.participants[1].isCheckedIn).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no paid orders exist', async () => {
      // Arrange
      const eventId = TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
      const order = new OrderTestBuilder()
        .withEventId(eventId)
        .asPending()
        .build();
      await fakeOrderRepository.create(order);

      // Act
      const result = await getParticipantsListUseCase.run({ eventId } as any);

      // Assert
      expect(result.participants).toHaveLength(0);
    });

    it('should return empty array when no orders exist for event', async () => {
      // Arrange
      const nonExistentEventId = TEST_CONSTANTS.IDS.NON_EXISTENT_ID;

      // Act
      const result = await getParticipantsListUseCase.run({
        eventId: nonExistentEventId,
      } as any);

      // Assert
      expect(result.participants).toHaveLength(0);
    });
  });
});
