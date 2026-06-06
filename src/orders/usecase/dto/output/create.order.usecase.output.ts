export default class CreateOrderUseCaseOutput {
  orderId: number;
  initPoint: string;
  sandboxInitPoint: string;
  totalAmount: number;
  expiresAt: Date;

  constructor(partial: Partial<CreateOrderUseCaseOutput>) {
    Object.assign(this, partial);
  }
}
