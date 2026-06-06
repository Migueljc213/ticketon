export default class CheckInOrderItemUseCaseInput {
  qrCode: string;
  checkedInBy: number;

  constructor(qrCode: string, checkedInBy: number) {
    this.qrCode = qrCode;
    this.checkedInBy = checkedInBy;
  }
}
