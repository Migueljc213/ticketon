import CreateOrderUseCase from '../create.order.usecase';
import FakeTicketRepository from 'src/tickets/external/repository/fakes/fake.ticket.repository';
import Order from 'src/orders/domain/entity/Order.entity';
import OrderItem from 'src/orders/domain/entity/OrderItem.entity';
import Ticket from 'src/tickets/domain/entity/Ticket.entity';
import PurchasedTicket from 'src/purchased-tickets/domain/entity/PurchasedTicket.entity';
import { TicketTestBuilder } from './helpers/test-builders';
import { TEST_CONSTANTS } from './helpers/test-constants';

describe('CreateOrderUseCase', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let fakeTicketRepository: FakeTicketRepository;
  let mockDataSource: any;
  let mockMercadoPagoService: any;
  let mockCheckoutTotal: any;
  let alreadyOwnedFreeTickets: number;

  beforeEach(() => {
    fakeTicketRepository = new FakeTicketRepository();
    let idCounter = 1;
    alreadyOwnedFreeTickets = 0;

    const mockManager = {
      findOne: jest.fn().mockResolvedValue({
        id: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        name: 'Test User',
        email: 'test@example.com',
      }),
      createQueryBuilder: (Entity: any, _alias: string) => {
        if (Entity === PurchasedTicket) {
          return {
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getRawOne: jest
              .fn()
              .mockImplementation(async () => ({
                count: String(alreadyOwnedFreeTickets),
              })),
          };
        }
        return {
          setLock: jest.fn().mockReturnThis(),
          whereInIds: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockImplementation(async () => fakeTicketRepository.findAll()),
        };
      },
      create: jest
        .fn()
        .mockImplementation((Entity: any, data: any) =>
          Object.assign(new Entity(), data),
        ),
      save: jest.fn().mockImplementation(async (entity: any) => {
        if (!entity.id) entity.id = idCounter++;
        return entity;
      }),
      update: jest
        .fn()
        .mockImplementation(async (Entity: any, id: any, data: any) => {
          if (Entity === Ticket) {
            await fakeTicketRepository.update(id, data);
          }
          return {};
        }),
      increment: jest.fn().mockResolvedValue({}),
      decrement: jest.fn().mockResolvedValue({}),
    };

    mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (cb: any) => cb(mockManager)),
    };

    mockMercadoPagoService = {
      createPreference: jest.fn().mockResolvedValue({
        id: 'pref-test-123',
        initPoint: 'https://www.mercadopago.com/init',
        sandboxInitPoint: 'https://sandbox.mercadopago.com/init',
      }),
    };

    mockCheckoutTotal = { inc: jest.fn() };

    createOrderUseCase = new CreateOrderUseCase(
      mockDataSource,
      mockMercadoPagoService,
      mockCheckoutTotal,
    );
  });

  describe('successful order creation', () => {
    it('should create an order and return initPoint', async () => {
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withPrice(TEST_CONSTANTS.PRICES.DEFAULT_TICKET_PRICE)
        .withQuantityAvailable(
          TEST_CONSTANTS.QUANTITIES.DEFAULT_QUANTITY_AVAILABLE,
        )
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [{ ticketId: ticket.id, quantity: 2 }],
        paymentMethod: 'credit_card',
      };

      const result = await createOrderUseCase.run(input);

      expect(result.orderId).toBeDefined();
      expect(result.initPoint).toBe('https://www.mercadopago.com/init');
      expect(result.totalAmount).toBe(
        TEST_CONSTANTS.PRICES.DEFAULT_TICKET_PRICE * 2,
      );
      expect(result.expiresAt).toBeDefined();
    });

    it('should update ticket quantities after order creation', async () => {
      const quantity = 3;
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withQuantityAvailable(10)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      await createOrderUseCase.run({
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [{ ticketId: ticket.id, quantity }],
      } as any);

      const updatedTicket = await fakeTicketRepository.findById(ticket.id);
      expect(updatedTicket?.quantitySold).toBe(quantity);
    });
  });

  describe('free tickets', () => {
    it('should bypass payment (no Mercado Pago) when all items are free', async () => {
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withPrice(0)
        .withQuantityAvailable(10)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const result = await createOrderUseCase.run({
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [{ ticketId: ticket.id, quantity: 2 }],
      } as any);

      expect(result.bypass).toBe(true);
      expect(result.totalAmount).toBe(0);
      expect(mockMercadoPagoService.createPreference).not.toHaveBeenCalled();
    });

    it('should reject when requested quantity exceeds the free-ticket cap per user/event', async () => {
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withPrice(0)
        .withQuantityAvailable(50)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      await expect(
        createOrderUseCase.run({
          userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
          eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
          customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
          customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
          items: [{ ticketId: ticket.id, quantity: 5 }],
        } as any),
      ).rejects.toThrow();
    });

    it('should reject when the user already owns free tickets up to the cap for this event', async () => {
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withPrice(0)
        .withQuantityAvailable(50)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);
      alreadyOwnedFreeTickets = 4;

      await expect(
        createOrderUseCase.run({
          userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
          eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
          customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
          customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
          items: [{ ticketId: ticket.id, quantity: 1 }],
        } as any),
      ).rejects.toThrow();
    });
  });

  describe('validation errors', () => {
    it('should throw when ticket does not exist', async () => {
      const input = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [{ ticketId: TEST_CONSTANTS.IDS.NON_EXISTENT_ID, quantity: 1 }],
      };

      await expect(createOrderUseCase.run(input as any)).rejects.toThrow();
    });

    it('should throw when insufficient tickets available', async () => {
      const ticket = new TicketTestBuilder()
        .withEventId(TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID)
        .withQuantityAvailable(1)
        .asActive()
        .build();
      await fakeTicketRepository.create(ticket);

      const input = {
        userId: TEST_CONSTANTS.IDS.DEFAULT_USER_ID,
        eventId: TEST_CONSTANTS.IDS.DEFAULT_EVENT_ID,
        customerName: TEST_CONSTANTS.CUSTOMERS.DEFAULT_NAME,
        customerEmail: TEST_CONSTANTS.CUSTOMERS.DEFAULT_EMAIL,
        items: [{ ticketId: ticket.id, quantity: 5 }],
      };

      await expect(createOrderUseCase.run(input as any)).rejects.toThrow();
    });
  });
});
