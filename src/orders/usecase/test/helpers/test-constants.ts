export const TEST_CONSTANTS = {
  IDS: {
    DEFAULT_USER_ID: 1,
    DEFAULT_EVENT_ID: 1,
    DEFAULT_TICKET_ID: 1,
    DEFAULT_ORDER_ID: 1,
    DEFAULT_ORDER_ITEM_ID: 1,
    DEFAULT_ORGANIZER_ID: 1,
    NON_EXISTENT_ID: 999,
  },
  DATES: {
    ONE_DAY_IN_MS: 86400000,
    ONE_DAY_AGO: new Date(Date.now() - 86400000),
    ONE_DAY_FROM_NOW: new Date(Date.now() + 86400000),
    JANUARY_15_2024: new Date('2024-01-15'),
    JANUARY_20_2024: new Date('2024-01-20'),
    FEBRUARY_10_2024: new Date('2024-02-10'),
  },
  PRICES: {
    DEFAULT_TICKET_PRICE: 100,
    DEFAULT_ORDER_TOTAL: 100,
    DEFAULT_UNIT_PRICE: 100,
    DEFAULT_TOTAL_PRICE: 100,
  },
  QUANTITIES: {
    DEFAULT_QUANTITY_AVAILABLE: 10,
    DEFAULT_QUANTITY_SOLD: 0,
    DEFAULT_QUANTITY: 1,
  },
  CUSTOMERS: {
    DEFAULT_NAME: 'John Doe',
    DEFAULT_EMAIL: 'john@example.com',
    DEFAULT_PHONE: '11999999999',
    ALTERNATIVE_NAME: 'Jane Doe',
    ALTERNATIVE_EMAIL: 'jane@example.com',
  },
  EVENTS: {
    DEFAULT_TITLE: 'Summer Music Festival',
    DEFAULT_DESCRIPTION: 'A great music festival',
    DEFAULT_CATEGORY: 'Music',
    DEFAULT_LOCATION_TYPE: 'physical',
  },
  TICKETS: {
    DEFAULT_NAME: 'VIP Ticket',
    DEFAULT_DESCRIPTION: 'VIP access ticket',
  },
  QR_CODES: {
    DEFAULT: 'TEST-QR-CODE',
    USED: 'USED-QR-CODE',
    INVALID: 'INVALID-QR-CODE',
    UNPAID: 'UNPAID-QR-CODE',
    FUTURE: 'FUTURE-QR-CODE',
  },
} as const;

