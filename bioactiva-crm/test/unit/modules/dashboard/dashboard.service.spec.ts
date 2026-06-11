jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock },
}))

import { dashboardService } from '@/services/modules/dashboard.service'

describe('dashboard/dashboard.service (API mode)', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('fetches metrics without params', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        totalLeads: 100,
        leadsEnProspecto: 40,
        leadsOfertados: 30,
        leadsCerrados: 30,
        cotizacionesActivas: 50000,
        actividadesPendientes: 15,
        tasaConversion: 30,
      },
    })

    const result = await dashboardService.getMetrics()
    expect(getMock).toHaveBeenCalledWith('/dashboard/metrics', { params: {} })
    expect(result.totalLeads).toBe(100)
    expect(result.tasaConversion).toBe(30)
  })

  it('fetches metrics with date filters', async () => {
    getMock.mockResolvedValueOnce({ data: { totalLeads: 50 } })

    await dashboardService.getMetrics({
      startDate: '2026-01-01',
      endDate: '2026-06-30',
    })

    expect(getMock).toHaveBeenCalledWith('/dashboard/metrics', {
      params: { startDate: '2026-01-01', endDate: '2026-06-30' },
    })
  })

  it('fetches metrics with idEncargado filter', async () => {
    getMock.mockResolvedValueOnce({ data: { totalLeads: 10 } })

    await dashboardService.getMetrics({ idEncargado: 3 })
    expect(getMock).toHaveBeenCalledWith('/dashboard/metrics', {
      params: { idEncargado: 3 },
    })
  })

  it('returns empty metrics structure from API', async () => {
    getMock.mockResolvedValueOnce({ data: {} })
    const result = await dashboardService.getMetrics()
    expect(result).toEqual({})
  })
})
