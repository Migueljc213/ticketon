import { Module } from '@nestjs/common';
import { getToken, makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const PAYMENTS_TOTAL_METRIC = 'payments_total';
export const CHECKOUT_TOTAL_METRIC = 'checkout_total';

@Module({
  providers: [
    makeCounterProvider({
      name: PAYMENTS_TOTAL_METRIC,
      help: 'Total de pagamentos processados via Mercado Pago',
      labelNames: ['status', 'payment_method'],
    }),
    makeCounterProvider({
      name: CHECKOUT_TOTAL_METRIC,
      help: 'Total de checkouts, por status do funil de compra',
      labelNames: ['status'],
    }),
  ],
  exports: [getToken(PAYMENTS_TOTAL_METRIC), getToken(CHECKOUT_TOTAL_METRIC)],
})
export default class BusinessMetricsModule {}
