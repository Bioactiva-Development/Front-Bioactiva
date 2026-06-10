export interface DashboardMetricsParams {
  startDate?: string
  endDate?: string
  idEncargado?: number
}

export interface DashboardMetrics {
  totalLeads: number
  averageTicketAmount: number
  conversionRate: number
  avgClosingTimeDays: number
  proposalToCloseRate: number
  avgProposalStageDays: number
  avgActivitiesPerLead: number
  pipelineTotalAmount: number
  closedRevenue: number
  stalledLeadPercentage: number
  periodStart: string
  periodEnd: string
}
