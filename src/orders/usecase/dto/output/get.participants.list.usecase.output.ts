export class Participant {
  orderId: number;
  orderItemId: number;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  ticketName: string;
  ticketPrice: number;
  qrCode: string;
  isCheckedIn: boolean;
  checkedInAt: Date | null;
  purchasedAt: Date;

  constructor(data: {
    orderId: number;
    orderItemId: number;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    ticketName: string;
    ticketPrice: number;
    qrCode: string;
    isCheckedIn: boolean;
    checkedInAt: Date | null;
    purchasedAt: Date;
  }) {
    this.orderId = data.orderId;
    this.orderItemId = data.orderItemId;
    this.customerName = data.customerName;
    this.customerEmail = data.customerEmail;
    this.customerPhone = data.customerPhone;
    this.ticketName = data.ticketName;
    this.ticketPrice = data.ticketPrice;
    this.qrCode = data.qrCode;
    this.isCheckedIn = data.isCheckedIn;
    this.checkedInAt = data.checkedInAt;
    this.purchasedAt = data.purchasedAt;
  }
}

export default class GetParticipantsListUseCaseOutput {
  participants: Participant[];

  constructor(participants: Participant[]) {
    this.participants = participants;
  }
}
