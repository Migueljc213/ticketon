import GetCheckInDashboardUseCase from '../get.checkin.dashboard.usecase';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import FakeOrderItemRepository from 'src/orders/external/repository/fakes/fake.order-item.repository';
import FakeEventRepository from 'src/events/external/repository/fakes/fake.event.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import {
  OrderTestBuilder,
  OrderItemTestBuilder,
  EventTestBuilder,
} from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('GetCheckInDashboardUseCase', () => {
  let getCheckInDashboardUseCase: GetCheckInDashboardUseCase;
  let fakeOrderRepository: FakeOrderRepository;
  let fakeOrderItemRepository: FakeOrderItemRepository;
  let fakeEventRepository: FakeEventRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    fakeOrderItemRepository = new FakeOrderItemRepository();
    fakeEventRepository = new FakeEventRepository();
    getCheckInDashboardUseCase = new GetCheckInDashboardUseCase(
      fakeOrderRepository,
      fakeOrderItemRepository,
      fakeEventRepository,
    );
  });

  describe('dashboard statistics', () => {
    it('should return dashboard statistics for an event', async () => {
      // Arrange
      const eventId = TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
      const event = new EventTestBuilder().withId(eventId).build();
      await fakeEventRepository.create(event);

      const order1 = new OrderTestBuilder()
        .withId(1)
        .withEventId(eventId)
        .withTotalAmount(100)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order1);

      const order2 = new OrderTestBuilder()
        .withId(2)
        .withEventId(eventId)
        .withTotalAmount(200)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order2);

      const item1 = new OrderItemTestBuilder()
        .withId(1)
        .withOrderId(order1.id)
        .withUnitPrice(100)
        .asUsed()
        .build();
      await fakeOrderItemRepository.create(item1);

      const item2 = new OrderItemTestBuilder()
        .withId(2)
        .withOrderId(order2.id)
        .withUnitPrice(200)
        .asUnused()
        .build();
      await fakeOrderItemRepository.create(item2);

      // Act
      const result = await getCheckInDashboardUseCase.run({ eventId } as any);

      // Assert
      expect(result.totalTicketsSold).toBe(2);
      expect(result.totalTicketsCheckedIn).toBe(1);
      expect(result.totalTicketsPending).toBe(1);
      expect(result.attendanceRate).toBe(50);
      expect(result.revenue.gross).toBe(300);
      expect(result.revenue.platformFee).toBe(21); // 7% of 300
      expect(result.revenue.net).toBe(279);
    });

    it('should only count paid orders in statistics', async () => {
      // Arrange
      const eventId = TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID;
      const event = new EventTestBuilder().withId(eventId).build();
      await fakeEventRepository.create(event);

      const pendingOrder = new OrderTestBuilder()
        .withId(1)
        .withEventId(eventId)
        .withTotalAmount(100)
        .asPending()
        .build();
      await fakeOrderRepository.create(pendingOrder);

      const paidOrder = new OrderTestBuilder()
        .withId(2)
        .withEventId(eventId)
        .withTotalAmount(200)
        .asPaid()
        .build();
      await fakeOrderRepository.create(paidOrder);

      const item1 = new OrderItemTestBuilder()
        .withId(1)
        .withOrderId(pendingOrder.id)
        .withUnitPrice(100)
        .build();
      await fakeOrderItemRepository.create(item1);

      const item2 = new OrderItemTestBuilder()
        .withId(2)
        .withOrderId(paidOrder.id)
        .withUnitPrice(200)
        .build();
      await fakeOrderItemRepository.create(item2);

      // Act
      const result = await getCheckInDashboardUseCase.run({ eventId } as any);

      // Assert
      expect(result.totalTicketsSold).toBe(1); // Only from paid order
      expect(result.revenue.gross).toBe(200); // Only from paid order
    });
  });

  describe('edge cases', () => {
    it('should return zero statistics when no orders exist', async () => {
      // Arrange
      const nonExistentEventId = TEST_CONSTANTS.IDS.NON_EXISTENT_ID;

      // Act
      const result = await getCheckInDashboardUseCase.run({
        eventId: nonExistentEventId,
      } as any);

      // Assert
      expect(result.totalTicketsSold).toBe(0);
      expect(result.totalTicketsCheckedIn).toBe(0);
      expect(result.totalTicketsPending).toBe(0);
      expect(result.attendanceRate).toBe(0);
      expect(result.revenue.gross).toBe(0);
    });
  });
});
