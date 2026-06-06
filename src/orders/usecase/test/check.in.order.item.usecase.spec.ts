import CheckInOrderItemUseCase from '../check.in.order.item.usecase';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import FakeOrderItemRepository from 'src/orders/external/repository/fakes/fake.order-item.repository';
import FakeEventRepository from 'src/events/external/repository/fakes/fake.event.repository';
import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import {
  OrderTestBuilder,
  OrderItemTestBuilder,
  EventTestBuilder,
  TicketTestBuilder,
} from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('CheckInOrderItemUseCase', () => {
  let checkInOrderItemUseCase: CheckInOrderItemUseCase;
  let fakeOrderRepository: FakeOrderRepository;
  let fakeOrderItemRepository: FakeOrderItemRepository;
  let fakeEventRepository: FakeEventRepository;
  let fakeTicketRepository: FakeTicketRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    fakeOrderItemRepository = new FakeOrderItemRepository();
    fakeEventRepository = new FakeEventRepository();
    fakeTicketRepository = new FakeTicketRepository();
    checkInOrderItemUseCase = new CheckInOrderItemUseCase(
      fakeOrderItemRepository,
      fakeOrderRepository,
      fakeEventRepository,
      fakeTicketRepository,
    );
  });

  describe('successful check-in', () => {
    it('should check in order item successfully when all conditions are met', async () => {
      // Arrange
      const event = new EventTestBuilder().inThePast().build();
      await fakeEventRepository.create(event);

      const ticket = new TicketTestBuilder()
        .withEventId(event.id)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const order = new OrderTestBuilder()
        .withEventId(event.id)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order);

      const qrCode = TEST_CONSTANTS.QR_CODES.DEFAULT;
      const orderItem = new OrderItemTestBuilder()
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode(qrCode)
        .asUnused()
        .build();
      await fakeOrderItemRepository.create(orderItem);

      const checkedInBy = TEST_CONSTANTS.IDS.DEFAULT_USER_ID;

      // Act
      const result = await checkInOrderItemUseCase.run({
        qrCode,
        checkedInBy,
      } as any);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Check-in realizado com sucesso');
      expect(result.orderItem?.isUsed).toBe(true);

      const updatedItem = await fakeOrderItemRepository.findById(orderItem.id);
      expect(updatedItem?.isUsed).toBe(true);
      expect(updatedItem?.checkedInBy).toBe(checkedInBy);
    });
  });

  describe('validation errors', () => {
    it('should return invalid when QR code does not exist', async () => {
      // Arrange
      const invalidQrCode = TEST_CONSTANTS.QR_CODES.INVALID;
      const checkedInBy = TEST_CONSTANTS.IDS.DEFAULT_USER_ID;

      // Act
      const result = await checkInOrderItemUseCase.run({
        qrCode: invalidQrCode,
        checkedInBy,
      } as any);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('QR Code não encontrado');
    });

    it('should return invalid when ticket has already been used', async () => {
      // Arrange
      const event = new EventTestBuilder().inThePast().build();
      await fakeEventRepository.create(event);

      const ticket = new TicketTestBuilder()
        .withEventId(event.id)
        .build();
      await fakeTicketRepository.create(ticket);

      const order = new OrderTestBuilder()
        .withEventId(event.id)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order);

      const qrCode = TEST_CONSTANTS.QR_CODES.USED;
      const orderItem = new OrderItemTestBuilder()
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode(qrCode)
        .asUsed()
        .build();
      await fakeOrderItemRepository.create(orderItem);

      // Act
      const result = await checkInOrderItemUseCase.run({
        qrCode,
        checkedInBy: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
      } as any);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Ingresso já foi utilizado');
    });

    it('should return invalid when order is not paid', async () => {
      // Arrange
      const event = new EventTestBuilder().inThePast().build();
      await fakeEventRepository.create(event);

      const ticket = new TicketTestBuilder()
        .withEventId(event.id)
        .build();
      await fakeTicketRepository.create(ticket);

      const order = new OrderTestBuilder()
        .withEventId(event.id)
        .asPending()
        .build();
      await fakeOrderRepository.create(order);

      const qrCode = TEST_CONSTANTS.QR_CODES.UNPAID;
      const orderItem = new OrderItemTestBuilder()
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode(qrCode)
        .asUnused()
        .build();
      await fakeOrderItemRepository.create(orderItem);

      // Act
      const result = await checkInOrderItemUseCase.run({
        qrCode,
        checkedInBy: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
      } as any);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Pedido não está pago');
    });

    it('should return invalid when event has not started yet', async () => {
      // Arrange
      const event = new EventTestBuilder().inTheFuture().build();
      await fakeEventRepository.create(event);

      const ticket = new TicketTestBuilder()
        .withEventId(event.id)
        .build();
      await fakeTicketRepository.create(ticket);

      const order = new OrderTestBuilder()
        .withEventId(event.id)
        .asPaid()
        .build();
      await fakeOrderRepository.create(order);

      const qrCode = TEST_CONSTANTS.QR_CODES.FUTURE;
      const orderItem = new OrderItemTestBuilder()
        .withOrderId(order.id)
        .withTicketId(ticket.id)
        .withQrCode(qrCode)
        .asUnused()
        .build();
      await fakeOrderItemRepository.create(orderItem);

      // Act
      const result = await checkInOrderItemUseCase.run({
        qrCode,
        checkedInBy: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
      } as any);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Evento ainda não começou');
    });
  });
});
