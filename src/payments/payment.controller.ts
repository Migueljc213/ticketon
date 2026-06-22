import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { HandleWebhookToken } from './payment.token';
import type {
  WebhookInput,
  WebhookOutput,
} from './usecase/handle.webhook.usecase';
import type IUsecase from 'src/common/interfaces/IUseCase';

@SkipThrottle() // o controller inteiro por padrão pula throttle
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
  // O Mercado Pago pode reenviar webhooks com alta frequência — limite generoso
  @SkipThrottle({ default: false })
  @Throttle({ default: { ttl: 60_000, limit: 30 } }) // 30 webhooks/min por IP
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: WebhookInput) {
    this.logger.log(`Webhook received: type=${body.type}`);
    return this.handleWebhook.run(body);
  }
}
