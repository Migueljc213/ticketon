import CreateOrderUseCase from '../create.order.usecase';
import CreateOrderUseCaseInputDto from 'src/orders/external/dto/create.order.usecase.input.dto';
import FakeOrderRepository from 'src/orders/external/repository/fakes/fake.order.repository';
import FakeOrderItemRepository from 'src/orders/external/repository/fakes/fake.order-item.repository';
import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import { OrderStatus } from 'src/orders/domain/order-status.enum';
import { TicketTestBuilder } from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('CreateOrderUseCase', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let fakeOrderRepository: FakeOrderRepository;
  let fakeOrderItemRepository: FakeOrderItemRepository;
  let fakeTicketRepository: FakeTicketRepository;

  beforeEach(() => {
    fakeOrderRepository = new FakeOrderRepository();
    fakeOrderItemRepository = new FakeOrderItemRepository();
    fakeTicketRepository = new FakeTicketRepository();
    createOrderUseCase = new CreateOrderUseCase(
      fakeOrderRepository,
      fakeOrderItemRepository,
      fakeTicketRepository,
    );
  });

  describe('successful order creation', () => {
    it('should create an order with tickets successfully', async () => {
      // Arrange
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withPrice(TEST_CONSTANTS.PRICES.DEFAULT_TICKET_PRICE)
        .withQuantityAvailable(TEST_CONSTANTS.QUANTITIES.DEFAULT_QUANTITY_AVAILABLE)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const quantity = 2;
      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        customerPhone: TEST_CONSTANTS.CUSTOMERS.DEFAULT_PHONE,
        items: [
          {
            ticketId: ticket.id,
            quantity,
          },
        ],
        paymentMethod: 'credit_card',
      };

      // Act
      const result = await createOrderUseCase.run(input as any);

      // Assert
      expect(result.order).toBeDefined();
      expect(result.order.userId).toBe(TEST_CONSTANTS.IDS.DEFAULT_USER_ID);
      expect(result.order.eventId).toBe(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID);
      expect(result.order.status).toBe(OrderStatus.PAID);
      expect(result.order.totalAmount).toBe(
        TEST_CONSTANTS.PRICES.DEFAULT_TICKET_PRICE * quantity,
      );
      expect(result.items).toHaveLength(quantity);
      expect(result.items[0].qrCode).toBeDefined();
    });

    it('should update ticket quantities after order creation', async () => {
      // Arrange
      const initialQuantityAvailable = 10;
      const quantitySold = 3;
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withQuantityAvailable(initialQuantityAvailable)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [
          {
            ticketId: ticket.id,
            quantity: quantitySold,
          },
        ],
      };

      // Act
      await createOrderUseCase.run(input as any);

      // Assert
      const updatedTicket = await fakeTicketRepository.findById(ticket.id);
      expect(updatedTicket?.quantitySold).toBe(quantitySold);
      expect(updatedTicket?.quantityAvailable).toBe(
        initialQuantityAvailable - quantitySold,
      );
    });
  });

  describe('validation errors', () => {
    it('should throw error when ticket does not exist', async () => {
      // Arrange
      const nonExistentTicketId = TEST_CONSTANTS.IDS.NON_EXISTENT_ID;
      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [
          {
            ticketId: nonExistentTicketId,
            quantity: 1,
          },
        ],
      };

      // Act & Assert
      await expect(createOrderUseCase.run(input as any)).rejects.toThrow(
        `Ticket ${nonExistentTicketId} not found`,
      );
    });

    it('should throw error when ticket does not belong to event', async () => {
      // Arrange
      const differentEventId = 2;
      const ticket = new TicketTestBuilder()
        .withEventId(differentEventId)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [
          {
            ticketId: ticket.id,
            quantity: 1,
          },
        ],
      };

      // Act & Assert
      await expect(createOrderUseCase.run(input as any)).rejects.toThrow(
        `Ticket ${ticket.id} does not belong to event ${TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID}`,
      );
    });

    it('should throw error when insufficient tickets available', async () => {
      // Arrange
      const quantityAvailable = 1;
      const requestedQuantity = 5;
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withQuantityAvailable(quantityAvailable)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [
          {
            ticketId: ticket.id,
            quantity: requestedQuantity,
          },
        ],
      };

      // Act & Assert
      await expect(createOrderUseCase.run(input as any)).rejects.toThrow(
        `Insufficient tickets available for ticket ${ticket.id}`,
      );
    });

    it('should throw error when ticket is not active', async () => {
      // Arrange
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .asInactive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input: CreateOrderUseCaseInputDto = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [
          {
            ticketId: ticket.id,
            quantity: 1,
          },
        ],
      };

      // Act & Assert
      await expect(createOrderUseCase.run(input as any)).rejects.toThrow(
        `Ticket ${ticket.id} is not active`,
      );
    });
  });
});
