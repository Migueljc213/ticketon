import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { HandleWebhookToken } from './payment.token';
import type {
  WebhookInput,
  WebhookOutput,
} from './usecase/handle.webhook.usecase';
import type IUsecase from 'src/common/interfaces/IUseCase';

@Controller('payments')
export default class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    @Inject(HandleWebhookToken)
    private readonly handleWebhook: IUsecase<WebhookInput, WebhookOutput>,
  ) {}

  /**
   * Recebe notificações do Mercado Pago (IPN/Webhook).
   * O MP envia POST com { type: 'payment', data: { id: '...' } }
   * e espera resposta 200 em até 22s.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: WebhookInput) {
    this.logger.log(`Webhook received: type=${body.type}`);
    return this.handleWebhook.run(body);
  }
}
