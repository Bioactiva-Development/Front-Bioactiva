import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockListInvitaciones = jest.fn()
const mockCreateInvitacion = jest.fn()
const mockRevokeInvitacion = jest.fn()

jest.mock('@/services/modules/usuarios.service', () => ({
  usuariosService: {
    listInvitaciones: mockListInvitaciones,
    createInvitacion: mockCreateInvitacion,
    revokeInvitacion: mockRevokeInvitacion,
  },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    invitaciones: {
      list: (filters?: Record<string, unknown>) => ['invitaciones', 'list', filters],
    },
  },
}))

import { useInvitaciones } from '@/hooks/usuarios/useInvitaciones'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usuarios/useInvitaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockListInvitaciones.mockResolvedValue({ data: [], total: 0 })
  })

  describe('list query', () => {
    it('fetches invitations list', async () => {
      const mockResponse = { data: [{ id: 1, correo: 'test@test.com' }], total: 1 }
      mockListInvitaciones.mockResolvedValueOnce(mockResponse)

      const { result } = renderHook(() => useInvitaciones(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))
      expect(result.current.invitaciones).toEqual(mockResponse.data)
      expect(result.current.total).toBe(1)
      expect(mockListInvitaciones).toHaveBeenCalledWith(undefined)
    })

    it('passes params to the service', async () => {
      mockListInvitaciones.mockResolvedValueOnce({ data: [], total: 0 })

      const params = { estado: 'pendiente' }
      renderHook(() => useInvitaciones(params as any), { wrapper })

      await waitFor(() => {
        expect(mockListInvitaciones).toHaveBeenCalledWith(params)
      })
    })

    it('handles error state', async () => {
      mockListInvitaciones.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useInvitaciones(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('createInvitacion', () => {
    it('creates invitation successfully', async () => {
      mockListInvitaciones.mockResolvedValueOnce({ data: [], total: 0 })
      mockCreateInvitacion.mockResolvedValueOnce({ id: 1 })

      const { result } = renderHook(() => useInvitaciones(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.createInvitacion({ correo: 'user@test.com', rol: 1 })
      })

      expect(mockCreateInvitacion).toHaveBeenCalledWith('user@test.com', 1)
    })
  })

  describe('revokeInvitacion', () => {
    it('revokes invitation by id', async () => {
      mockListInvitaciones.mockResolvedValueOnce({ data: [], total: 0 })
      mockRevokeInvitacion.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useInvitaciones(), { wrapper })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.revokeInvitacion(5)
      })

      expect(mockRevokeInvitacion).toHaveBeenCalledWith(5)
    })
  })
})
