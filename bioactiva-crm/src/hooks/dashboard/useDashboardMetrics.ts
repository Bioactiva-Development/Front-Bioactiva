import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants/queryKeys'
import { dashboardService } from '@/services/modules/dashboard.service'
import { DashboardMetricsParams } from '@/types/dashboard.types'

export function useDashboardMetrics(params?: DashboardMetricsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.metrics(params),
    queryFn:  () => dashboardService.getMetrics(params),
    staleTime: 1000 * 60 * 2,
  })
}
