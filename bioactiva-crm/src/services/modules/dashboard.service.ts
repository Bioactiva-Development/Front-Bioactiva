import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  DashboardMetrics,
  DashboardMetricsParams,
} from '@/types/dashboard.types'

const buildDashboardParams = (params?: DashboardMetricsParams) => {
  const query: Record<string, string | number> = {}

  if (params?.startDate) query.startDate = params.startDate
  if (params?.endDate) query.endDate = params.endDate
  if (params?.idEncargado) query.idEncargado = params.idEncargado

  return query
}

export const dashboardService = {
  getMetrics: async (
    params?: DashboardMetricsParams
  ): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>(
      ENDPOINTS.dashboard.metrics,
      { params: buildDashboardParams(params) }
    )

    return response.data
  },
}
