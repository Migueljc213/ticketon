export default class CreateOrderUseCaseOutput {
  orderId: number;
  initPoint: string;
  sandboxInitPoint: string;
  subtotalAmount: number;
  platformFee: number;
  totalAmount: number;
  expiresAt: Date;
  ticketCount?: number;
  bypass?: boolean;

  constructor(partial: Partial<CreateOrderUseCaseOutput>) {
    Object.assign(this, partial);
  }
}
