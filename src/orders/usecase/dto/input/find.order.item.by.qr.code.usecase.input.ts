export default class FindOrderItemByQrCodeUseCaseInput {
  qrCode: string;

  constructor(qrCode: string) {
    this.qrCode = qrCode;
  }
}

