/**
 * Política de Reembolso — Ticketon
 *
 * Fundamentação legal:
 *   - CDC Art. 49: direito de arrependimento em 7 dias para compras online
 *   - PROCON / STJ: arrependimento não se aplica quando restam ≤ 72h para o evento
 *   - CDC Art. 35: cancelamento pelo organizador gera reembolso integral obrigatório
 */

export const REFUND_POLICY = {
  /** Horas antes do evento a partir das quais nenhum reembolso é devido (CDC + PROCON). */
  NO_REFUND_HOURS_BEFORE_EVENT: 72,

  /** Dias a partir da compra dentro dos quais o Art. 49 do CDC garante 100% de reembolso. */
  COOLING_OFF_DAYS: 7,

  /** Taxa de serviço da plataforma — nunca reembolsável ao comprador. */
  PLATFORM_FEE_RATE: 0.07,
} as const;

export type RefundEligibility =
  | { eligible: true;  refundAmount: number; reason: string }
  | { eligible: false; refundAmount: 0;      reason: string };

/**
 * Calcula se um pedido é elegível a reembolso e qual o valor devolvido.
 *
 * @param totalPaid      Valor total pago pelo comprador (incluindo taxa de plataforma).
 * @param subtotal       Valor dos ingressos sem taxa de plataforma.
 * @param purchasedAt    Data/hora da compra.
 * @param eventStartsAt  Data/hora de início do evento.
 * @param requestedAt    Data/hora do pedido de cancelamento (default: agora).
 */
export function calculateRefundEligibility(
  totalPaid: number,
  subtotal: number,
  purchasedAt: Date,
  eventStartsAt: Date,
  requestedAt: Date = new Date(),
): RefundEligibility {
  const msToEvent = eventStartsAt.getTime() - requestedAt.getTime();
  const hoursToEvent = msToEvent / (1000 * 60 * 60);

  // Evento já começou ou passou
  if (hoursToEvent <= 0) {
    return {
      eligible: false,
      refundAmount: 0,
      reason:
        'O evento já teve início. Não é possível solicitar cancelamento após o início do evento.',
    };
  }

  // Menos de 72h para o evento — proteção absoluta (PROCON + STJ)
  if (hoursToEvent < REFUND_POLICY.NO_REFUND_HOURS_BEFORE_EVENT) {
    return {
      eligible: false,
      refundAmount: 0,
      reason: `Cancelamentos não são permitidos dentro de ${REFUND_POLICY.NO_REFUND_HOURS_BEFORE_EVENT} horas antes do evento. Esta regra se aplica independentemente da data de compra, conforme orientação do PROCON e jurisprudência do STJ.`,
    };
  }

  const daysSincePurchase =
    (requestedAt.getTime() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Dentro do período CDC (7 dias da compra) + mais de 72h antes do evento
  if (daysSincePurchase <= REFUND_POLICY.COOLING_OFF_DAYS) {
    // Reembolsa apenas o subtotal — taxa de plataforma é não reembolsável
    const refundAmount = Math.round(subtotal * 100) / 100;
    return {
      eligible: true,
      refundAmount,
      reason: `Cancelamento dentro do período de arrependimento (Art. 49 CDC). Reembolso de ${refundAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (valor dos ingressos). A taxa de serviço da plataforma não é reembolsável.`,
    };
  }

  // Fora do período CDC e mais de 72h antes do evento — sem direito de reembolso
  return {
    eligible: false,
    refundAmount: 0,
    reason:
      'O prazo de arrependimento de 7 dias (Art. 49 CDC) já expirou. Cancelamentos fora deste prazo não geram direito a reembolso conforme política da plataforma e legislação vigente.',
  };
}
