import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Preference } from 'mercadopago';

export interface PreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface CreatePreferenceInput {
  items: PreferenceItem[];
  externalReference: string;
  backUrl?: string;
}

export interface CreatedPreference {
  id: string;
  initPoint: string;
  sandboxInitPoint: string;
}

@Injectable()
export default class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly preferenceClient: Preference;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN') ?? '';
    const mpConfig = new MercadoPagoConfig({ accessToken });
    this.preferenceClient = new Preference(mpConfig);
    this.frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
  }

  async createPreference(
    input: CreatePreferenceInput,
  ): Promise<CreatedPreference> {
    this.logger.log(
      `Creating MP preference for order ${input.externalReference}`,
    );

    const backUrl = input.backUrl ?? this.frontendUrl;

    const response = await this.preferenceClient.create({
      body: {
        items: input.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id ?? 'BRL',
        })),
        external_reference: input.externalReference,
        back_urls: {
          success: `${backUrl}/checkout/success?order=${input.externalReference}`,
          failure: `${backUrl}/checkout/failure?order=${input.externalReference}`,
          pending: `${backUrl}/checkout/pending?order=${input.externalReference}`,
        },
        auto_return: 'approved',
        notification_url: `${this.config.get<string>('BACKEND_URL') ?? 'http://localhost:3000'}/api/webhook`,
        expires: true,
        expiration_date_to: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        payment_methods: {
          installments: 12,
        },
      },
    });

    return {
      id: response.id ?? '',
      initPoint: response.init_point ?? '',
      sandboxInitPoint: response.sandbox_init_point ?? '',
    };
  }
}
