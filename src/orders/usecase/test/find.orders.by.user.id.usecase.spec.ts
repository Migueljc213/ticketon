import FindOrdersByUserIdUseCase from '../find.orders.by.user.id.usecase';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import FakeOrderItemRepository from 'src/orders/external/repository/fakes/fake.order-item.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import {
  OrderTestBuilder,
  OrderItemTestBuilder,
} from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('FindOrdersByUserIdUseCase', () => {
  let findOrdersByUserIdUseCase: FindOrdersByUserIdUseCase;
  let fakeOrderRepository: FakeOrderRepository;
  let fakeOrderItemRepository: FakeOrderItemRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    fakeOrderItemRepository = new FakeOrderItemRepository();
    findOrdersByUserIdUseCase = new FindOrdersByUserIdUseCase(
      fakeOrderRepository,
      fakeOrderItemRepository,
    );
  });

  describe('successful retrieval', () => {
    it('should return orders with items for a user', async () => {
      // Arrange
      const userId = TEST_CONSTANTS.IDS.DEFAULT_USER_ID;
      const order1 = new OrderTestBuilder()
        .withId(1)
        .withUserId(userId)
        .withEventId(1)
        .withTotalAmount(100)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order1);

      const order2 = new OrderTestBuilder()
        .withId(2)
        .withUserId(userId)
        .withEventId(2)
        .withTotalAmount(200)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order2);

      const item1 = new OrderItemTestBuilder()
        .withOrderId(order1.id)
        .withTicketId(1)
        .withQuantity(1)
        .withUnitPrice(100)
        .withTotalPrice(100)
        .build();
      await fakeOrderItemRepository.create(item1);

      const item2 = new OrderItemTestBuilder()
        .withOrderId(order2.id)
        .withTicketId(2)
        .withQuantity(2)
        .withUnitPrice(100)
        .withTotalPrice(200)
        .build();
      await fakeOrderItemRepository.create(item2);

      // Act
      const result = await findOrdersByUserIdUseCase.run({ userId } as any);

      // Assert
      expect(result.orders).toHaveLength(2);
      expect(result.orders[0].order.userId).toBe(userId);
      expect(result.orders[0].items).toHaveLength(1);
      expect(result.orders[1].items).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('should return empty array when user has no orders', async () => {
      // Arrange
      const nonExistentUserId = TEST_CONSTANTS.IDS.NON_EXISTENT_ID;

      // Act
      const result = await findOrdersByUserIdUseCase.run({
        userId: nonExistentUserId,
      } as any);

      // Assert
      expect(result.orders).toHaveLength(0);
    });
  });
});
