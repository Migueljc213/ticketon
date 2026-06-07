export interface OrderItemInput {
  ticketId: number;
  quantity: number;
}

export default class CreateOrderUseCaseInput {
  userId: number;
  items: OrderItemInput[];
  backUrl?: string;
  customerGender?: string;
  customerAge?: number;
  customerNeighborhood?: string;

  constructor(partial: Partial<CreateOrderUseCaseInput>) {
    Object.assign(this, partial);
  }
}
