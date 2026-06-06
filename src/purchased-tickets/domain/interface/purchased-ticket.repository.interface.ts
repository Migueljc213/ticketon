import PurchasedTicket from '../entity/PurchasedTicket.entity';

export default interface IPurchasedTicketRepository {
  findByUserId(userId: number): Promise<PurchasedTicket[]>;
  findByQrCode(qrCode: string): Promise<PurchasedTicket | null>;
  findByOrderId(orderId: number): Promise<PurchasedTicket[]>;
  markAsUsed(qrCode: string): Promise<PurchasedTicket>;
}
