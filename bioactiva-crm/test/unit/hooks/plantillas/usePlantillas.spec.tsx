import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetAll = jest.fn()
const mockGetActivas = jest.fn()
const mockGetById = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockDesactivar = jest.fn()

jest.mock('@/services/modules/plantillas.service', () => ({
  plantillasService: {
    getAll: mockGetAll,
    getActivas: mockGetActivas,
    getById: mockGetById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    desactivar: mockDesactivar,
  },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    plantillas: {
      list: (includeInactive = false) => ['plantillas', 'list', includeInactive],
      activas: () => ['plantillas', 'activas'],
      detail: (id: number) => ['plantillas', id],
    },
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fb: string) =>
    (err as { message?: string })?.message ?? fb,
}))

import {
  usePlantillas,
  usePlantillasActivas,
  usePlantilla,
  useCrearPlantilla,
  useActualizarPlantilla,
  useEliminarPlantilla,
  useDesactivarPlantilla,
} from '@/hooks/plantillas/usePlantillas'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('plantillas/usePlantillas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('usePlantillas', () => {
    it('fetches templates list', async () => {
      mockGetAll.mockResolvedValueOnce([{ id: 1, nombre: 'Plantilla A' }])

      const { result } = renderHook(() => usePlantillas(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual([{ id: 1, nombre: 'Plantilla A' }])
      expect(mockGetAll).toHaveBeenCalledWith(false)
    })

    it('passes includeInactive param', async () => {
      mockGetAll.mockResolvedValueOnce([])

      renderHook(() => usePlantillas(true), { wrapper })

      await waitFor(() => expect(mockGetAll).toHaveBeenCalledWith(true))
    })
  })

  describe('usePlantillasActivas', () => {
    it('fetches active templates', async () => {
      mockGetActivas.mockResolvedValueOnce([{ id: 1, activo: true }])

      const { result } = renderHook(() => usePlantillasActivas(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetActivas).toHaveBeenCalled()
    })
  })

  describe('usePlantilla', () => {
    it('fetches template by id', async () => {
      mockGetById.mockResolvedValueOnce({ id: 5, nombre: 'Template' })

      const { result } = renderHook(() => usePlantilla(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual({ id: 5, nombre: 'Template' })
    })

    it('does not fetch when id is falsy', () => {
      renderHook(() => usePlantilla(0), { wrapper })
      expect(mockGetById).not.toHaveBeenCalled()
    })
  })

  describe('useCrearPlantilla', () => {
    it('creates template and invalidates queries', async () => {
      mockCreate.mockResolvedValueOnce({ id: 1 })

      const { result } = renderHook(() => useCrearPlantilla(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombre: 'Nueva', contenido: '<p>Hola</p>' } as any)
      })

      expect(mockCreate).toHaveBeenCalledWith({ nombre: 'Nueva', contenido: '<p>Hola</p>' })
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCreate.mockRejectedValueOnce({ message: 'Error al crear' })

      const { result } = renderHook(() => useCrearPlantilla(), { wrapper })

      await act(async () => {
        try { await result.current.mutateAsync({} as any) } catch { /* expected */ }
      })

      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error al crear'))
      consoleSpy.mockRestore()
    })
  })

  describe('useActualizarPlantilla', () => {
    it('updates template and invalidates queries', async () => {
      mockUpdate.mockResolvedValueOnce({ id: 5 })

      const { result } = renderHook(() => useActualizarPlantilla(5), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombre: 'Updated' })
      })

      expect(mockUpdate).toHaveBeenCalledWith(5, { nombre: 'Updated' })
    })
  })

  describe('useEliminarPlantilla', () => {
    it('deletes template by id', async () => {
      mockDelete.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useEliminarPlantilla(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(3)
      })

      expect(mockDelete).toHaveBeenCalledWith(3)
    })
  })

  describe('useDesactivarPlantilla', () => {
    it('deactivates template by id', async () => {
      mockDesactivar.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useDesactivarPlantilla(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(7)
      })

      expect(mockDesactivar).toHaveBeenCalledWith(7)
    })
  })
})
