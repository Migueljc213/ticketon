import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { createHmac } from 'crypto';
import { HandleWebhookToken } from './payment.token';
import type {
  WebhookInput,
  WebhookOutput,
} from './usecase/handle.webhook.usecase';
import type IUsecase from 'src/common/interfaces/IUseCase';

@SkipThrottle()
@Controller('')
export default class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    @Inject(HandleWebhookToken)
    private readonly handleWebhook: IUsecase<WebhookInput, WebhookOutput>,
    private readonly config: ConfigService,
  ) {}

  @SkipThrottle({ default: false })
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('api/webhook')
  @HttpCode(200)
  async webhook(
    @Body() body: WebhookInput,
    @Headers('x-signature') xSignature: string | undefined,
    @Headers('x-request-id') xRequestId: string | undefined,
  ) {
    this.logger.log(`Webhook received: type=${body.type}`);

    const secret = this.config.get<string>('MP_WEBHOOK_SECRET');
    if (secret) {
      this.verifySignature(secret, xSignature, xRequestId, body.data?.id);
    }

    return this.handleWebhook.run(body);
  }

  private verifySignature(
    secret: string,
    xSignature: string | undefined,
    xRequestId: string | undefined,
    dataId: string | undefined,
  ): void {
    if (!xSignature) throw new UnauthorizedException('Missing x-signature');

    const parts = Object.fromEntries(
      xSignature.split(',').map((p) => p.split('=')),
    );
    const ts = parts['ts'];
    const v1 = parts['v1'];

    if (!ts || !v1) throw new UnauthorizedException('Invalid x-signature format');

    const manifest = [
      dataId ? `id:${dataId}` : null,
      xRequestId ? `request-id:${xRequestId}` : null,
      `ts:${ts}`,
    ]
      .filter(Boolean)
      .join(';') + ';';

    const expected = createHmac('sha256', secret).update(manifest).digest('hex');

    if (expected !== v1) throw new UnauthorizedException('Invalid webhook signature');
  }
}
