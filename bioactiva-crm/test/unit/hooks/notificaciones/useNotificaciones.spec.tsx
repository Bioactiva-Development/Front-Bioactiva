import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetCentro = jest.fn()
const mockGetAll = jest.fn()
const mockGetByLead = jest.fn()
const mockMarcarLeida = jest.fn()
const mockMarcarTodasLeidas = jest.fn()
const mockCancelarProgramada = jest.fn()
const mockCreateRecordatorio = jest.fn()
const mockCreateSeguimiento = jest.fn()

jest.mock('@/services/modules/notificaciones.service', () => ({
  notificacionesService: {
    getCentro: mockGetCentro,
    getAll: mockGetAll,
    getByLead: mockGetByLead,
    marcarLeida: mockMarcarLeida,
    marcarTodasLeidas: mockMarcarTodasLeidas,
    cancelarProgramada: mockCancelarProgramada,
    createRecordatorio: mockCreateRecordatorio,
    createSeguimiento: mockCreateSeguimiento,
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { message?: string })?.message ?? fallback,
}))

import {
  useCentroNotificaciones,
  useNotificaciones,
  useNotificacionesPorLead,
  useMarcarLeida,
  useMarcarTodasLeidas,
  useCancelarProgramada,
  useCrearRecordatorio,
  useCrearSeguimiento,
} from '@/hooks/notificaciones/useNotificaciones'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('notificaciones/useNotificaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useCentroNotificaciones', () => {
    it('fetches notification center data', async () => {
      const mockCentro = { notificaciones: [], total: 0, noLeidas: 0 }
      mockGetCentro.mockResolvedValueOnce(mockCentro)

      const { result } = renderHook(() => useCentroNotificaciones(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockCentro)
      expect(mockGetCentro).toHaveBeenCalled()
    })
  })

  describe('useNotificaciones', () => {
    it('fetches notification list', async () => {
      const mockList = [{ id: 1, mensaje: 'Test' }]
      mockGetAll.mockResolvedValueOnce(mockList)

      const { result } = renderHook(() => useNotificaciones(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockList)
      expect(mockGetAll).toHaveBeenCalled()
    })
  })

  describe('useNotificacionesPorLead', () => {
    it('fetches notifications by lead id', async () => {
      const mockData = [{ id: 1, leadId: 42 }]
      mockGetByLead.mockResolvedValueOnce(mockData)

      const { result } = renderHook(() => useNotificacionesPorLead(42), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockData)
      expect(mockGetByLead).toHaveBeenCalledWith(42)
    })

    it('does not fetch when leadId is falsy', () => {
      renderHook(() => useNotificacionesPorLead(0), { wrapper })
      expect(mockGetByLead).not.toHaveBeenCalled()
    })
  })

  describe('useMarcarLeida', () => {
    it('marks notification as read and invalidates queries', async () => {
      mockMarcarLeida.mockResolvedValueOnce({ ok: true })
      const queryClientSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

      const { result } = renderHook(() => useMarcarLeida(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(mockMarcarLeida).toHaveBeenCalledWith(1)
      expect(queryClientSpy).toHaveBeenCalledWith({ queryKey: ['notificaciones'] })
    })
  })

  describe('useMarcarTodasLeidas', () => {
    it('marks all as read and invalidates queries', async () => {
      mockMarcarTodasLeidas.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useMarcarTodasLeidas(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync()
      })

      expect(mockMarcarTodasLeidas).toHaveBeenCalled()
    })
  })

  describe('useCancelarProgramada', () => {
    it('cancels scheduled notification', async () => {
      mockCancelarProgramada.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCancelarProgramada(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(5)
      })

      expect(mockCancelarProgramada).toHaveBeenCalledWith(5)
    })
  })

  describe('useCrearRecordatorio', () => {
    it('creates reminder notification', async () => {
      const mockData = { leadId: 1, mensaje: 'Recordatorio' }
      mockCreateRecordatorio.mockResolvedValueOnce({ id: 10 })

      const { result } = renderHook(() => useCrearRecordatorio(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(mockData as any)
      })

      expect(mockCreateRecordatorio).toHaveBeenCalledWith(mockData)
    })
  })

  describe('useCrearSeguimiento', () => {
    it('creates follow-up notification', async () => {
      const mockData = { leadId: 1, mensaje: 'Seguimiento' }
      mockCreateSeguimiento.mockResolvedValueOnce({ id: 11 })

      const { result } = renderHook(() => useCrearSeguimiento(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(mockData as any)
      })

      expect(mockCreateSeguimiento).toHaveBeenCalledWith(mockData)
    })
  })

  describe('mutation error handling', () => {
    it('logs error when marcarLeida fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockMarcarLeida.mockRejectedValueOnce({ message: 'Error al marcar' })

      const { result } = renderHook(() => useMarcarLeida(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync(1)
        } catch {
          // expected
        }
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error al marcar')
      })
      consoleSpy.mockRestore()
    })
  })
})
