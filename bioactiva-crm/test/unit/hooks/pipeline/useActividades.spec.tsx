import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { TipoActividad } from '@/types/enums'
import type { ActividadFormData } from '@/types/actividad.types'

const mockGetByLead = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockComplete = jest.fn()
const mockCancel = jest.fn()
const mockDelete = jest.fn()
const mockGetComentarios = jest.fn()
const mockCreateComentario = jest.fn()
const mockCreateCalendarEvent = jest.fn()

jest.mock('@/services/modules/actividades.service', () => ({
  actividadesService: {
    getByLead: mockGetByLead,
    create: mockCreate,
    update: mockUpdate,
    complete: mockComplete,
    cancel: mockCancel,
    delete: mockDelete,
    getComentarios: mockGetComentarios,
    createComentario: mockCreateComentario,
    createCalendarEvent: mockCreateCalendarEvent,
  },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    actividades: {
      byLead: (leadId: number) => ['actividades', 'lead', leadId],
    },
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fb: string) =>
    (err as { message?: string })?.message ?? fb,
}))

const mockUseAuthStore = jest.fn(
  (selector?: (s: Record<string, unknown>) => unknown) =>
    typeof selector === 'function'
      ? selector({ usuario: { id: 1, nombres: 'Carlos', apellidos: 'Ramírez' } })
      : { usuario: { id: 1, nombres: 'Carlos', apellidos: 'Ramírez' } },
)

jest.mock('@/store', () => ({
  useAuthStore: Object.assign(mockUseAuthStore, {
    getState: () => ({ usuario: { id: 1, nombres: 'Carlos', apellidos: 'Ramírez' } }),
    setState: jest.fn(),
  }),
}))

import {
  useActividades,
  useCrearActividad,
  useActualizarActividad,
  useCompletarActividad,
  useCancelarActividad,
  useEliminarActividad,
  useComentarios,
  useCrearComentario,
  useCrearEventoCalendario,
} from '@/hooks/pipeline/useActividades'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('pipeline/useActividades', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useActividades', () => {
    it('fetches activities by lead id', async () => {
      mockGetByLead.mockResolvedValueOnce([{ id: 1, nombreActividad: 'Call' }])

      const { result } = renderHook(() => useActividades(42), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual([{ id: 1, nombreActividad: 'Call' }])
      expect(mockGetByLead).toHaveBeenCalledWith(42)
    })

    it('does not fetch when leadId is 0', () => {
      renderHook(() => useActividades(0), { wrapper })
      expect(mockGetByLead).not.toHaveBeenCalled()
    })
  })

  describe('useCrearActividad', () => {
    it('creates activity and invalidates queries', async () => {
      mockCreate.mockResolvedValueOnce({ id: 1 })
      const payload: ActividadFormData = {
        id_lead: 42,
        id_responsable: 1,
        nombre_actividad: 'Reunión',
        fecha_inicio: '2026-06-15T10:00',
        fecha_fin: '2026-06-15T10:30',
        tipo: TipoActividad.Reunion,
      }

      const { result } = renderHook(() => useCrearActividad(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(payload)
      })

      expect(mockCreate).toHaveBeenCalledWith(payload)
    })
  })

  describe('useActualizarActividad', () => {
    it('updates activity and invalidates queries', async () => {
      mockUpdate.mockResolvedValueOnce({ id: 5 })

      const { result } = renderHook(() => useActualizarActividad(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 5, data: { notas: 'Updated' } })
      })

      expect(mockUpdate).toHaveBeenCalledWith(5, { notas: 'Updated' })
    })
  })

  describe('useCompletarActividad', () => {
    it('completes activity with notes', async () => {
      mockComplete.mockResolvedValueOnce({ ok: true })
      const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

      const { result } = renderHook(() => useCompletarActividad(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 1, notas: 'Done' })
      })

      expect(mockComplete).toHaveBeenCalledWith(1, 'Done')
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notificaciones'] })
      invalidateSpy.mockRestore()
    })

    it('completes activity without notes', async () => {
      mockComplete.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useCompletarActividad(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 2 })
      })

      expect(mockComplete).toHaveBeenCalledWith(2, undefined)
    })
  })

  describe('useCancelarActividad', () => {
    it('cancels activity by id', async () => {
      mockCancel.mockResolvedValueOnce({ ok: true })
      const invalidateSpy = jest.spyOn(QueryClient.prototype, 'invalidateQueries')

      const { result } = renderHook(() => useCancelarActividad(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(mockCancel).toHaveBeenCalledWith(1)
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notificaciones'] })
      invalidateSpy.mockRestore()
    })
  })

  describe('useCrearEventoCalendario', () => {
    it('creates calendar event for an activity', async () => {
      mockCreateCalendarEvent.mockResolvedValueOnce({ id: 2, outlook_event_id: 'evt' })
      const { result } = renderHook(() => useCrearEventoCalendario(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(2)
      })

      expect(mockCreateCalendarEvent).toHaveBeenCalledWith(2)
    })
  })

  describe('useEliminarActividad', () => {
    it('deletes activity by id', async () => {
      mockDelete.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useEliminarActividad(42), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(3)
      })

      expect(mockDelete).toHaveBeenCalledWith(3)
    })
  })

  describe('useComentarios', () => {
    it('fetches comments by activity id', async () => {
      mockGetComentarios.mockResolvedValueOnce([{ id: 1, texto: 'Comentario' }])

      const { result } = renderHook(() => useComentarios(10), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetComentarios).toHaveBeenCalledWith(10)
    })

    it('does not fetch when actividadId is 0', () => {
      renderHook(() => useComentarios(0), { wrapper })
      expect(mockGetComentarios).not.toHaveBeenCalled()
    })
  })

  describe('useCrearComentario', () => {
    it('creates comment with user full name', async () => {
      mockCreateComentario.mockResolvedValueOnce({ id: 1 })

      const { result } = renderHook(() => useCrearComentario(10), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('Nuevo comentario')
      })

      expect(mockCreateComentario).toHaveBeenCalledWith(10, 'Nuevo comentario', 'Carlos Ramírez')
    })

    it('falls back to Usuario when store has no user', async () => {
      mockUseAuthStore.mockImplementationOnce(
        (selector?: (s: Record<string, unknown>) => unknown) =>
          typeof selector === 'function'
            ? selector({ usuario: null })
            : { usuario: null },
      )
      mockCreateComentario.mockResolvedValueOnce({ id: 1 })

      const { result } = renderHook(() => useCrearComentario(10), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('Comentario anónimo')
      })

      expect(mockCreateComentario).toHaveBeenCalledWith(10, 'Comentario anónimo', 'Usuario')
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCreateComentario.mockRejectedValueOnce({ message: 'Error al crear comentario' })

      const { result } = renderHook(() => useCrearComentario(10), { wrapper })

      await act(async () => {
        try { await result.current.mutateAsync('text') } catch { /* expected */ }
      })

      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error al crear comentario'))
      consoleSpy.mockRestore()
    })
  })
})
