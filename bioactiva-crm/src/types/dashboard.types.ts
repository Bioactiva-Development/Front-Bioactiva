export interface DashboardMetricsParams {
  startDate?: string
  endDate?: string
  idEncargado?: number
}

/**
 * Montos reportados por divisa. Las cotizaciones pueden estar en soles (PEN)
 * o dolares (USD) y el backend nunca los combina: cada divisa se reporta por
 * separado. No sumar ni convertir entre `pen` y `usd`.
 */
export type MoneyByCurrency = {
  pen: number
  usd: number
}

export interface DashboardMetrics {
  totalLeads: number
  averageTicketAmount: MoneyByCurrency
  conversionRate: number
  avgClosingTimeDays: number
  proposalToCloseRate: number
  avgProposalStageDays: number
  avgActivitiesPerLead: number
  pipelineTotalAmount: MoneyByCurrency
  closedRevenue: MoneyByCurrency
  stalledLeadPercentage: number
  periodStart: string
  periodEnd: string
  // Distribuciones para gráficos (estado backend + cantidad).
  distribucionPipeline?: Array<{ estado: string; cantidad: number }>
  distribucionCotizaciones?: Array<{ estado: string; cantidad: number }>
}
