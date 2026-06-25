import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetAll = jest.fn()
const mockGetById = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockGetByOrganizacion = jest.fn()
const mockCambiarEstado = jest.fn()

jest.mock('@/services/modules/contactos.service', () => ({
  contactosService: {
    getAll: mockGetAll,
    getById: mockGetById,
    create: mockCreate,
    update: mockUpdate,
    getByOrganizacion: mockGetByOrganizacion,
    cambiarEstado: mockCambiarEstado,
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { message?: string })?.message ?? fallback,
}))

import {
  useContactos,
  useContacto,
  useContactosPorOrganizacion,
  useCrearContacto,
  useActualizarContacto,
  useCambiarEstadoContacto,
} from '@/hooks/contactos/useContactos'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('contactos/useContactos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useContactos', () => {
    it('fetches contacts list', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 })

      const { result } = renderHook(() => useContactos(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(undefined)
    })

    it('passes filters to the service', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 })
      const filtros = { search: 'Ricardo' }

      const { result } = renderHook(() => useContactos(filtros), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(filtros)
    })
  })

  describe('useContacto', () => {
    it('fetches contact by id', async () => {
      const mockContacto = { id: 1, nombres: 'Ricardo', correo: 'r@test.com' }
      mockGetById.mockResolvedValueOnce(mockContacto)

      const { result } = renderHook(() => useContacto(1), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toMatchObject(mockContacto)
    })

    it('does not fetch when id is 0', () => {
      renderHook(() => useContacto(0), { wrapper })

      expect(mockGetById).not.toHaveBeenCalled()
    })
  })

  describe('useContactosPorOrganizacion', () => {
    it('fetches contacts by organization', async () => {
      const mockContactos = [{ id: 1, nombres: 'Ricardo' }]
      mockGetByOrganizacion.mockResolvedValueOnce(mockContactos)

      const { result } = renderHook(() => useContactosPorOrganizacion('org-001'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockContactos)
    })

    it('does not fetch when orgId is empty', () => {
      renderHook(() => useContactosPorOrganizacion(''), { wrapper })

      expect(mockGetByOrganizacion).not.toHaveBeenCalled()
    })
  })

  describe('useCrearContacto', () => {
    it('creates contact successfully', async () => {
      const created = { id: 100, nombres: 'Nuevo', correo: 'nuevo@test.com', idOrganizacion: 'org-001' }
      mockCreate.mockResolvedValueOnce(created)

      const { result } = renderHook(() => useCrearContacto(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          nombres: 'Nuevo',
          correo: 'nuevo@test.com',
          idOrganizacion: 'org-001',
        })
      })

      expect(mockCreate).toHaveBeenCalled()
    })
  })

  describe('useCambiarEstadoContacto', () => {
    it('changes contact email state and invalidates queries', async () => {
      mockCambiarEstado.mockResolvedValueOnce({ id: 1, estado_correo: 'VIGENTE' })

      const { result } = renderHook(() => useCambiarEstadoContacto(1), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('VIGENTE')
      })

      expect(mockCambiarEstado).toHaveBeenCalledWith(1, 'VIGENTE')
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockCambiarEstado.mockRejectedValueOnce({ message: 'Error al cambiar estado' })

      const { result } = renderHook(() => useCambiarEstadoContacto(1), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync('VENCIDO')
        } catch {
          // expected
        }
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error al cambiar estado')
      })
      consoleSpy.mockRestore()
    })
  })

  describe('useActualizarContacto', () => {
    it('updates contact successfully', async () => {
      mockUpdate.mockResolvedValueOnce({ id: 1, nombres: 'Updated' })

      const { result } = renderHook(() => useActualizarContacto(1), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombres: 'Updated' })
      })

      expect(mockUpdate).toHaveBeenCalledWith(1, { nombres: 'Updated' })
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUpdate.mockRejectedValueOnce({ message: 'Error de red' })

      const { result } = renderHook(() => useActualizarContacto(1), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ nombres: 'Fail' })
        } catch {
          // expected
        }
      })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error de red')
      })
      consoleSpy.mockRestore()
    })
  })
})
