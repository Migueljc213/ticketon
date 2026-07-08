import { Module } from '@nestjs/common';
import { getToken, makeCounterProvider } from '@willsoto/nestjs-prometheus';

export const PAYMENTS_TOTAL_METRIC = 'payments_total';
export const CHECKOUT_TOTAL_METRIC = 'checkout_total';
export const LOGIN_ATTEMPTS_TOTAL_METRIC = 'login_attempts_total';
export const CHECKIN_VALIDATIONS_TOTAL_METRIC = 'checkin_validations_total';

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
    makeCounterProvider({
      name: LOGIN_ATTEMPTS_TOTAL_METRIC,
      help: 'Total de tentativas de login, por resultado',
      labelNames: ['status'],
    }),
    makeCounterProvider({
      name: CHECKIN_VALIDATIONS_TOTAL_METRIC,
      help: 'Total de validações de QR code no check-in, por resultado',
      labelNames: ['result'],
    }),
  ],
  exports: [
    getToken(PAYMENTS_TOTAL_METRIC),
    getToken(CHECKOUT_TOTAL_METRIC),
    getToken(LOGIN_ATTEMPTS_TOTAL_METRIC),
    getToken(CHECKIN_VALIDATIONS_TOTAL_METRIC),
  ],
})
export default class BusinessMetricsModule {}
