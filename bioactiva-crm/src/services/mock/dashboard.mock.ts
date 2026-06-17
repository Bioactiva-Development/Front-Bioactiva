import { DashboardMetrics, DashboardMetricsParams } from '@/types/dashboard.types'

export const mockGetMetrics = async (
  params?: DashboardMetricsParams
): Promise<DashboardMetrics> => {
  await new Promise((resolve) => setTimeout(resolve, 250))

  return {
    totalLeads:            48,
    averageTicketAmount:   12500,
    conversionRate:        31.25,
    avgClosingTimeDays:    22.4,
    proposalToCloseRate:   68.5,
    avgProposalStageDays:  8.2,
    avgActivitiesPerLead:  3.7,
    pipelineTotalAmount:   287500,
    closedRevenue:         75000,
    stalledLeadPercentage: 12.5,
    periodStart: params?.startDate ?? '2026-01-01T00:00:00.000Z',
    periodEnd:   params?.endDate   ?? '2027-01-01T00:00:00.000Z',
  }
}
