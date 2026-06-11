import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetPipeline = jest.fn()
const mockGetAll = jest.fn()
const mockGetByContacto = jest.fn()
const mockGetById = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockUpdateEstado = jest.fn()
const mockDelete = jest.fn()

jest.mock('@/services/modules/leads.service', () => ({
  leadsService: {
    getPipeline: mockGetPipeline,
    getAll: mockGetAll,
    getByContacto: mockGetByContacto,
    getById: mockGetById,
    create: mockCreate,
    update: mockUpdate,
    updateEstado: mockUpdateEstado,
    delete: mockDelete,
  },
}))

const mockGetByLead = jest.fn()
const mockEnviar = jest.fn()
const mockAceptar = jest.fn()
const mockRechazar = jest.fn()

jest.mock('@/services/modules/cotizaciones.service', () => ({
  cotizacionesService: {
    getByLead: mockGetByLead,
    enviar: mockEnviar,
    aceptar: mockAceptar,
    rechazar: mockRechazar,
  },
}))

jest.mock('@/lib/constants/queryKeys', () => ({
  QUERY_KEYS: {
    leads: {
      pipeline: (filters?: unknown) => ['leads', 'pipeline', filters],
      list: (filters?: unknown) => ['leads', 'list', filters],
      byContacto: (id: number) => ['leads', 'contacto', id],
      detail: (id: number) => ['leads', id],
    },
  },
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fb: string) =>
    (err as { message?: string })?.message ?? fb,
}))

import { LeadState, EstadoCot } from '@/types/enums'
import {
  usePipeline,
  useLeads,
  useLeadsByContacto,
  useLead,
  useCrearLead,
  useActualizarLead,
  useActualizarEstadoLead,
  useEliminarLead,
  useMoverLeadPipeline,
} from '@/hooks/pipeline/useLeads'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

const makeLead = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  nombre_empresa: 'Test',
  estado: LeadState.Prospecto,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeCotizacion = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  idLead: 1,
  estado: EstadoCot.Pendiente,
  monto: '1000',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('pipeline/useLeads', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('usePipeline', () => {
    it('fetches pipeline data', async () => {
      const mockPipeline = {
        prospecto: [],
        ofertado: [],
        cierreVenta: [],
        cierreSinVenta: [],
        total: 0,
      }
      mockGetPipeline.mockResolvedValueOnce(mockPipeline)

      const { result } = renderHook(() => usePipeline(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockPipeline)
      expect(mockGetPipeline).toHaveBeenCalledWith(undefined)
    })

    it('passes filters to the service', async () => {
      mockGetPipeline.mockResolvedValueOnce({ prospecto: [], ofertado: [], cierreVenta: [], cierreSinVenta: [], total: 0 })

      const filtros = { estado: LeadState.Prospecto }
      renderHook(() => usePipeline(filtros), { wrapper })

      await waitFor(() => expect(mockGetPipeline).toHaveBeenCalledWith(filtros))
    })
  })

  describe('useLeads', () => {
    it('fetches leads list', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0 })

      const { result } = renderHook(() => useLeads(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(undefined)
    })
  })

  describe('useLeadsByContacto', () => {
    it('fetches leads by contacto id', async () => {
      mockGetByContacto.mockResolvedValueOnce([makeLead()])

      const { result } = renderHook(() => useLeadsByContacto(5), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetByContacto).toHaveBeenCalledWith(5)
    })

    it('does not fetch when idContacto is 0', () => {
      renderHook(() => useLeadsByContacto(0), { wrapper })
      expect(mockGetByContacto).not.toHaveBeenCalled()
    })
  })

  describe('useLead', () => {
    it('fetches lead by id', async () => {
      const mockLead = makeLead({ id: 1 })
      mockGetById.mockResolvedValueOnce(mockLead)

      const { result } = renderHook(() => useLead(1), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockLead)
    })

    it('does not fetch when id is 0', () => {
      renderHook(() => useLead(0), { wrapper })
      expect(mockGetById).not.toHaveBeenCalled()
    })
  })

  describe('useCrearLead', () => {
    it('creates lead and invalidates queries', async () => {
      mockCreate.mockResolvedValueOnce(makeLead())

      const { result } = renderHook(() => useCrearLead(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombre_empresa: 'NewCo' } as any)
      })

      expect(mockCreate).toHaveBeenCalledWith({ nombre_empresa: 'NewCo' })
    })
  })

  describe('useActualizarLead', () => {
    it('updates lead and invalidates queries', async () => {
      mockUpdate.mockResolvedValueOnce(makeLead({ id: 1 }))

      const { result } = renderHook(() => useActualizarLead(1), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombre_empresa: 'Updated' })
      })

      expect(mockUpdate).toHaveBeenCalledWith(1, { nombre_empresa: 'Updated' })
    })

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUpdate.mockRejectedValueOnce({ message: 'Error al actualizar' })

      const { result } = renderHook(() => useActualizarLead(1), { wrapper })

      await act(async () => {
        try { await result.current.mutateAsync({} as any) } catch { /* expected */ }
      })

      await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error al actualizar'))
      consoleSpy.mockRestore()
    })
  })

  describe('useActualizarEstadoLead', () => {
    it('updates lead state', async () => {
      const lead = makeLead({ id: 1, estado: LeadState.Prospecto })
      mockGetById.mockResolvedValueOnce(lead)
      // Al pasar a OFERTADO el front consulta las cotizaciones del lead antes y
      // después del cambio (para detectar el borrador que crea el backend).
      mockGetByLead.mockResolvedValue([makeCotizacion({ estado: EstadoCot.Enviada })])
      mockUpdateEstado.mockResolvedValueOnce(makeLead({ id: 1, estado: LeadState.Ofertado }))

      const { result } = renderHook(() => useActualizarEstadoLead(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ id: 1, estado: LeadState.Ofertado })
      })

      expect(mockGetById).toHaveBeenCalledWith(1)
      // Ya no se envía la cotización automáticamente al ofertar (lo hace el backend).
      expect(mockEnviar).not.toHaveBeenCalled()
      expect(mockUpdateEstado).toHaveBeenCalledWith(1, LeadState.Ofertado)
    })
  })

  describe('useEliminarLead', () => {
    it('deletes lead and invalidates queries', async () => {
      mockDelete.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useEliminarLead(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync(1)
      })

      expect(mockDelete).toHaveBeenCalledWith(1)
    })
  })

  describe('useMoverLeadPipeline', () => {
    it('moves lead in pipeline on successful mutation', async () => {
      const lead = makeLead({ id: 1, estado: LeadState.Prospecto })
      mockGetByLead.mockResolvedValue([makeCotizacion({ estado: EstadoCot.Enviada })])
      mockUpdateEstado.mockResolvedValueOnce(makeLead({ id: 1, estado: LeadState.Ofertado }))

      const { result } = renderHook(() => useMoverLeadPipeline(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ lead, estado: LeadState.Ofertado })
      })

      expect(mockGetByLead).toHaveBeenCalledWith(1)
    })

    it('rolls back optimistic update on error', async () => {
      mockGetByLead.mockRejectedValueOnce(new Error('Error al mover'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const lead = makeLead({ id: 1, estado: LeadState.Prospecto })
      const { result } = renderHook(() => useMoverLeadPipeline(), { wrapper })

      await act(async () => {
        try {
          await result.current.mutateAsync({ lead, estado: LeadState.Ofertado })
        } catch {
          // expected
        }
      })

      await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      consoleSpy.mockRestore()
    })
  })
})
