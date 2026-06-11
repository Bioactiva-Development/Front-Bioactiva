import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetMetrics = jest.fn()
jest.mock('@/services/modules/dashboard.service', () => ({
  dashboardService: { getMetrics: mockGetMetrics },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    dashboard: {
      metrics: (params?: unknown) => ['dashboard', 'metrics', params],
    },
  },
}))

import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('dashboard/useDashboardMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches dashboard metrics', async () => {
    const mockData = {
      totalLeads: 100,
      leadsPorEstado: { Prospecto: 40, Ofertado: 30, Cerrado: 30 },
      cotizacionesPorEstado: { Pendiente: 10, Enviada: 15, Aceptada: 3, Rechazada: 2 },
      actividadesPendientes: 8,
    }
    mockGetMetrics.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
    expect(mockGetMetrics).toHaveBeenCalledWith(undefined)
  })

  it('passes params to the service', async () => {
    mockGetMetrics.mockResolvedValueOnce({ totalLeads: 50 })

    const params = { periodo: 'month' }
    const { result } = renderHook(() => useDashboardMetrics(params), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetMetrics).toHaveBeenCalledWith(params)
  })

  it('returns loading state initially', () => {
    mockGetMetrics.mockImplementationOnce(() => new Promise(() => {}))

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })
})
