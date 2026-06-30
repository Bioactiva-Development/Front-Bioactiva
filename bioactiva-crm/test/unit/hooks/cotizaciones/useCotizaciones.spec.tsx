import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetAll = jest.fn()
const mockGetById = jest.fn()
const mockGetKpis = jest.fn()
const mockGetByLead = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockEnviar = jest.fn()
const mockAceptar = jest.fn()
const mockRechazar = jest.fn()

jest.mock('@/services/modules/cotizaciones.service', () => ({
  cotizacionesService: {
    getAll: mockGetAll,
    getById: mockGetById,
    getKpis: mockGetKpis,
    getByLead: mockGetByLead,
    create: mockCreate,
    update: mockUpdate,
    enviar: mockEnviar,
    aceptar: mockAceptar,
    rechazar: mockRechazar,
  },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    cotizaciones: {
      list: (filters?: unknown) => ['cotizaciones', 'list', filters],
      detail: (id: number) => ['cotizaciones', id],
      byLead: (leadId: number) => ['cotizaciones', 'lead', leadId],
    },
    leads: {
      list:     (filters?: unknown) => ['leads', 'list', filters],
      pipeline: (filters?: unknown) => ['leads', 'pipeline', filters],
      column:   (estado: string, filters?: unknown) => ['leads', 'column', estado, filters],
      detail:   (id: number) => ['leads', id],
    },
    dashboard: {
      metrics: (filters?: unknown) => ['dashboard', 'metrics', filters],
    },
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fb: string) =>
    (err as { message?: string })?.message ?? fb,
}))

import {
  useCotizaciones,
  useCotizacion,
  useCotizacionKpis,
  useCotizacionesPorLead,
  useCrearCotizacion,
  useActualizarCotizacion,
  useEnviarCotizacion,
  useAceptarCotizacion,
  useRechazarCotizacion,
} from '@/hooks/cotizaciones/useCotizaciones'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('cotizaciones/useCotizaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useCotizaciones', () => {
    it('fetches quotations list', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0 })

      const { result } = renderHook(() => useCotizaciones(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(undefined)
    })

    it('passes filters to the service', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0 })
      const filtros = { estado: 'PENDIENTE' }

      renderHook(() => useCotizaciones(filtros as any), { wrapper })

      await waitFor(() => expect(mockGetAll).toHaveBeenCalledWith(filtros))
    })
  })

  describe('useCotizacion', () => {
    it('fetches quotation by id', async () => {
      mockGetById.mockResolvedValueOnce({ id: 10, monto: '500' })

      const { result } = renderHook(() => useCotizacion(10), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ id: 10, monto: '500' })
    })

    it('does not fetch when id is 0', () => {
      renderHook(() => useCotizacion(0), { wrapper })
      expect(mockGetById).not.toHaveBeenCalled()
    })
  })

  describe('useCotizacionKpis', () => {
    it('fetches KPIs', async () => {
      mockGetKpis.mockResolvedValueOnce({ pendientes: 5, enviadas: 3, aceptadas: 2, rechazadas: 1 })

      const { result } = renderHook(() => useCotizacionKpis(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetKpis).toHaveBeenCalled()
    })
  })

  describe('useCotizacionesPorLead', () => {
    it('fetches quotations by lead id', async () => {
      mockGetByLead.mockResolvedValueOnce([{ id: 1, idLead: 42 }])

      const { result } = renderHook(() => useCotizacionesPorLead(42), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetByLead).toHaveBeenCalledWith(42)
    })

    it('does not fetch when leadId is 0', () => {
      renderHook(() => useCotizacionesPorLead(0), { wrapper })
      expect(mockGetByLead).not.toHaveBeenCalled()
    })
  })

  describe('useCrearCotizacion', () => {
    it('creates quotation and invalidates queries', async () => {
      mockCreate.mockResolvedValueOnce({ id: 1 })

      const { result } = renderHook(() => useCrearCotizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombreServicio: 'Servicio' } as any)
      })

      expect(mockCreate).toHaveBeenCalledWith({ nombreServicio: 'Servicio' })
    })
  })

  describe('useActualizarCotizacion', () => {
    it('updates quotation and invalidates queries', async () => {
      mockUpdate.mockResolvedValueOnce({ id: 5 })

      const { result } = renderHook(() => useActualizarCotizacion(5), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ monto: '1000' })
      })

      expect(mockUpdate).toHaveBeenCalledWith(5, { monto: '1000' })
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUpdate.mockRejectedValueOnce({ message: 'Error' })

      const { result } = renderHook(() => useActualizarCotizacion(1), { wrapper })

      await act(async () => {
        try { await result.current.mutateAsync({} as any) } catch { /* expected */ }
      })

      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error'))
      consoleSpy.mockRestore()
    })
  })

  describe('useEnviarCotizacion', () => {
    it('sends quotation', async () => {
      mockEnviar.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useEnviarCotizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(mockEnviar).toHaveBeenCalledWith(1)
    })
  })

  describe('useAceptarCotizacion', () => {
    it('accepts quotation', async () => {
      mockAceptar.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useAceptarCotizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(2)
      })

      expect(mockAceptar).toHaveBeenCalledWith(2)
    })
  })

  describe('useRechazarCotizacion', () => {
    it('rejects quotation', async () => {
      mockRechazar.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useRechazarCotizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(3)
      })

      expect(mockRechazar).toHaveBeenCalledWith(3)
    })
  })
})
