import GetPlatformRevenueUseCase from '../get.platform.revenue.usecase';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import { OrderTestBuilder } from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('GetPlatformRevenueUseCase', () => {
  let getPlatformRevenueUseCase: GetPlatformRevenueUseCase;
  let fakeOrderRepository: FakeOrderRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    getPlatformRevenueUseCase = new GetPlatformRevenueUseCase(
      fakeOrderRepository,
    );
  });

  describe('revenue calculation', () => {
    it('should return platform revenue statistics for paid orders only', async () => {
      // Arrange
      const order1 = new OrderTestBuilder()
        .withId(1)
        .withTotalAmount(100)
        .asPaid()
        .withCreatedAt(TEST_CONSTANTS.DATES.JANUARY_15_2024)
        .build();
      await fakeOrderRepository.create(order1);

      const order2 = new OrderTestBuilder()
        .withId(2)
        .withTotalAmount(200)
        .asPaid()
        .withCreatedAt(TEST_CONSTANTS.DATES.JANUARY_20_2024)
        .build();
      await fakeOrderRepository.create(order2);

      const order3 = new OrderTestBuilder()
        .withId(3)
        .withTotalAmount(150)
        .asPending()
        .build();
      await fakeOrderRepository.create(order3);

      // Act
      const result = await getPlatformRevenueUseCase.run();

      // Assert
      expect(result.totalRevenue).toBe(300); // Only paid orders
      expect(result.platformFee).toBe(21); // 7% of 300
      expect(result.netRevenue).toBe(279); // 300 - 21
      expect(result.totalOrders).toBe(2); // Only paid orders
      expect(result.revenueByMonth.length).toBeGreaterThan(0);
    });

    it('should group revenue by month correctly', async () => {
      // Arrange
      const order1 = new OrderTestBuilder()
        .withId(1)
        .withTotalAmount(100)
        .asPaid()
        .withCreatedAt(TEST_CONSTANTS.DATES.JANUARY_15_2024)
        .build();
      await fakeOrderRepository.create(order1);

      const order2 = new OrderTestBuilder()
        .withId(2)
        .withTotalAmount(200)
        .asPaid()
        .withCreatedAt(TEST_CONSTANTS.DATES.JANUARY_20_2024)
        .build();
      await fakeOrderRepository.create(order2);

      const order3 = new OrderTestBuilder()
        .withId(3)
        .withTotalAmount(150)
        .asPaid()
        .withCreatedAt(TEST_CONSTANTS.DATES.FEBRUARY_10_2024)
        .build();
      await fakeOrderRepository.create(order3);

      // Act
      const result = await getPlatformRevenueUseCase.run();

      // Assert
      const januaryRevenue = result.revenueByMonth.find(
        (r) => r.month === '2024-01',
      );
      const februaryRevenue = result.revenueByMonth.find(
        (r) => r.month === '2024-02',
      );

      expect(januaryRevenue).toBeDefined();
      expect(januaryRevenue?.revenue).toBe(300); // 100 + 200
      expect(februaryRevenue).toBeDefined();
      expect(februaryRevenue?.revenue).toBe(150);
    });
  });

  describe('edge cases', () => {
    it('should return zero revenue when no paid orders exist', async () => {
      // Act
      const result = await getPlatformRevenueUseCase.run();

      // Assert
      expect(result.totalRevenue).toBe(0);
      expect(result.platformFee).toBe(0);
      expect(result.netRevenue).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(result.revenueByMonth).toHaveLength(0);
    });
  });
});
