import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const mockGetAll = jest.fn()
const mockGetById = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockSunatPorRuc = jest.fn()
const mockSunatPorNombre = jest.fn()
const mockGetByIdConRelaciones = jest.fn()

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock('@/services/modules/organizaciones.service', () => ({
  organizacionesService: {
    getAll: mockGetAll,
    getById: mockGetById,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    sunatPorRuc: mockSunatPorRuc,
    sunatPorNombre: mockSunatPorNombre,
    getByIdConRelaciones: mockGetByIdConRelaciones,
  },
}))

const mockUseAuthStore = jest.fn(
  (selector?: (s: Record<string, unknown>) => unknown) =>
    typeof selector === 'function'
      ? selector({ usuario: { id: 1 } })
      : { usuario: { id: 1 } },
)

jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    mockUseAuthStore,
    { getState: () => ({ usuario: { id: 1 } }), setState: jest.fn() }
  ),
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { message?: string })?.message ?? fallback,
}))

import {
  useOrganizaciones,
  useOrganizacion,
  useCrearOrganizacion,
  useActualizarOrganizacion,
  useEliminarOrganizacion,
  useSunat,
  useOrganizacionConRelaciones,
} from '@/hooks/organizaciones/useOrganizaciones'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'

/**
 * UseOrganizaciones
 * -----------------
 * Responsable de:
 * - listar organizaciones con filtros (useQuery)
 * - obtener organización por ID (useQuery)
 * - crear organización (useMutation)
 * - actualizar organización (useMutation)
 * - consultar SUNAT por RUC y por razón social
 * - obtener organización con relaciones
 */
// STATUS: Implementación completa.

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('organizaciones/useOrganizaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useOrganizaciones', () => {
    it('fetches organizations list', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 })

      const { result } = renderHook(() => useOrganizaciones(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(undefined)
    })

    it('passes filters to the service', async () => {
      mockGetAll.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 10 })
      const filtros = { sector: Sector.AGROALIMENTARIA }

      const { result } = renderHook(() => useOrganizaciones(filtros), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetAll).toHaveBeenCalledWith(filtros)
    })
  })

  describe('useOrganizacion', () => {
    it('fetches organization by id', async () => {
      const mockOrg = { id: 'org-001', nombre: 'Altomayo' }
      mockGetById.mockResolvedValueOnce(mockOrg)

      const { result } = renderHook(() => useOrganizacion('org-001'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toMatchObject(mockOrg)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useOrganizacion(''), { wrapper })

      expect(result.current.isPending).toBe(true)
    })

    it('does not fetch when id is falsy', () => {
      const { result } = renderHook(() => useOrganizacion(''), { wrapper })

      expect(mockGetById).not.toHaveBeenCalled()
    })
  })

  describe('useCrearOrganizacion', () => {
    it('creates organization successfully', async () => {
      const created = { id: 'org-007', nombre: 'Nueva Org' }
      mockCreate.mockResolvedValueOnce(created)

      const { result } = renderHook(() => useCrearOrganizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          nombre: 'Nueva Org',
          nombre_comercial: 'Nueva Org',
          codigo_cliente: 'NVA-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
          sector: Sector.OTROS,
        })
      })

      expect(mockCreate).toHaveBeenCalled()
    })

    it('rejects when idAuthor is missing', async () => {
      mockUseAuthStore.mockImplementationOnce(
        (selector?: (s: Record<string, unknown>) => unknown) =>
          typeof selector === 'function'
            ? selector({ usuario: undefined })
            : { usuario: undefined },
      )

      const { result } = renderHook(() => useCrearOrganizacion(), { wrapper })

      await expect(async () => {
        await result.current.mutateAsync({
          nombre: 'Nueva Org',
          nombre_comercial: 'Nueva Org',
          codigo_cliente: 'NVA-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
          sector: Sector.OTROS,
        })
      }).rejects.toThrow('Sesión expirada. Vuelve a iniciar sesión para registrar una organización.')
    })
  })

  describe('useEliminarOrganizacion', () => {
    it('deletes organization and redirects', async () => {
      mockDelete.mockResolvedValueOnce({ ok: true })

      const { result } = renderHook(() => useEliminarOrganizacion(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('org-001')
      })

      expect(mockDelete).toHaveBeenCalledWith('org-001')
      expect(mockRouterPush).toHaveBeenCalledWith('/organizaciones')
    })
  })

  describe('useActualizarOrganizacion', () => {
    it('updates organization successfully', async () => {
      mockUpdate.mockResolvedValueOnce({ id: 'org-001', nombre: 'Updated' })

      const { result } = renderHook(() => useActualizarOrganizacion('org-001'), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({ nombre: 'Updated' })
      })

      expect(mockUpdate).toHaveBeenCalledWith('org-001', { nombre: 'Updated' })
    })
  })

  describe('useSunat', () => {
    it('returns loading state during RUC consultation', async () => {
      mockSunatPorRuc.mockImplementationOnce(() => new Promise(() => {}))

      const { result } = renderHook(() => useSunat())

      act(() => { result.current.consultarPorRuc('20601258529') })

      expect(result.current.loadingRuc).toBe(true)
    })

    it('returns SUNAT result for RUC consultation', async () => {
      const mockResult = { ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.' }
      mockSunatPorRuc.mockResolvedValueOnce(mockResult)

      const { result } = renderHook(() => useSunat())

      await act(async () => {
        await result.current.consultarPorRuc('20601258529')
      })

      expect(result.current.loadingRuc).toBe(false)
      expect(result.current.resultadoRuc).toEqual(mockResult)
      expect(mockSunatPorRuc).toHaveBeenCalledWith('20601258529')
    })

    it('handles SUNAT RUC error', async () => {
      mockSunatPorRuc.mockRejectedValueOnce({ message: 'No se encontraron resultados' })

      const { result } = renderHook(() => useSunat())

      await act(async () => {
        await result.current.consultarPorRuc('00000000000')
      })

      expect(result.current.errorSunat).toBe('No se encontraron resultados')
    })

    it('returns SUNAT results for name consultation', async () => {
      const mockResults = [{ ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.' }]
      mockSunatPorNombre.mockResolvedValueOnce(mockResults)

      const { result } = renderHook(() => useSunat())

      await act(async () => {
        await result.current.consultarPorNombre('Altomayo')
      })

      expect(result.current.resultadosNombre).toEqual(mockResults)
      expect(mockSunatPorNombre).toHaveBeenCalledWith('Altomayo')
    })

    it('handles SUNAT name consultation error', async () => {
      mockSunatPorNombre.mockRejectedValueOnce(new Error('Error de red'))

      const { result } = renderHook(() => useSunat())

      await act(async () => {
        await result.current.consultarPorNombre('Unknown')
      })

      expect(result.current.errorSunat).toBe('Error de red')
    })

    it('clears SUNAT results', async () => {
      const mockResult = { ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.' }
      mockSunatPorRuc.mockResolvedValueOnce(mockResult)

      const { result } = renderHook(() => useSunat())

      await act(async () => {
        await result.current.consultarPorRuc('20601258529')
      })
      expect(result.current.resultadoRuc).toBeTruthy()

      act(() => { result.current.limpiar() })

      expect(result.current.resultadoRuc).toBeNull()
      expect(result.current.resultadosNombre).toEqual([])
      expect(result.current.errorSunat).toBeNull()
    })
  })

  describe('useOrganizacionConRelaciones', () => {
    it('fetches organization with relations', async () => {
      const mockData = {
        id: 'org-001',
        nombre: 'Altomayo',
        contactos: [],
        leads: [],
        cotizaciones: [],
      }
      mockGetByIdConRelaciones.mockResolvedValueOnce(mockData)

      const { result } = renderHook(() => useOrganizacionConRelaciones('org-001'), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toMatchObject(mockData)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useOrganizacionConRelaciones(''), { wrapper })

      expect(mockGetByIdConRelaciones).not.toHaveBeenCalled()
    })
  })
})
