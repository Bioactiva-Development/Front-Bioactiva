/**
 * OrganizacionesService — modo Mock
 * ----------------------------------
 * Verifica que organizacionesService delega correctamente en los mocks
 * cuando USE_MOCK = true.
 */
// STATUS: Tests de ruteo a mock.

jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: true,
}))

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockGetOrganizaciones = jest.fn()
const mockGetOrganizacion = jest.fn()
const mockCreateOrganizacion = jest.fn()
const mockUpdateOrganizacion = jest.fn()
const mockSunatPorRuc = jest.fn()
const mockSunatPorNombre = jest.fn()
const mockGetOrganizacionConRelaciones = jest.fn()

jest.mock('@/services/mock/organizaciones.mock', () => ({
  mockGetOrganizaciones,
  mockGetOrganizacion,
  mockCreateOrganizacion,
  mockUpdateOrganizacion,
  mockSunatPorRuc,
  mockSunatPorNombre,
  mockGetOrganizacionConRelaciones,
}))

import { organizacionesService } from '@/services/modules/organizaciones.service'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'

describe('organizaciones/organizaciones.service (mock mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates getAll to mockGetOrganizaciones', async () => {
    const mockResponse = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    }
    mockGetOrganizaciones.mockResolvedValueOnce(mockResponse)

    const result = await organizacionesService.getAll({ sector: Sector.AGROALIMENTARIA })

    expect(mockGetOrganizaciones).toHaveBeenCalledWith({ sector: Sector.AGROALIMENTARIA })
    expect(result).toEqual(mockResponse)
  })

  it('delegates getById to mockGetOrganizacion', async () => {
    const mockOrg = {
      id: 'org-001',
      codigo_cliente: 'ALT-001',
      nombre: 'Altomayo',
      nombre_comercial: 'Altomayo',
      tipo: TipoEmpresa.EmpresaNacional,
      tamano: TamanoEmpresa.Grande,
      sector: Sector.AGROALIMENTARIA,
      id_author: 1,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-01-01T08:00:00Z',
    }
    mockGetOrganizacion.mockResolvedValueOnce(mockOrg)

    const result = await organizacionesService.getById('org-001')

    expect(mockGetOrganizacion).toHaveBeenCalledWith('org-001')
    expect(result).toEqual(mockOrg)
  })

  it('delegates create to mockCreateOrganizacion', async () => {
    const formData = {
      nombre: 'Nueva Org',
      nombre_comercial: 'Nueva Org',
      codigo_cliente: 'NVA-001',
      tipo: TipoEmpresa.EmpresaNacional,
      tamano: TamanoEmpresa.Micro,
      sector: Sector.OTROS,
    }
    const mockCreated = { id: 'org-999', ...formData, id_author: 1, created_at: '', updated_at: '' }
    mockCreateOrganizacion.mockResolvedValueOnce(mockCreated)

    const result = await organizacionesService.create(formData, 1)

    expect(mockCreateOrganizacion).toHaveBeenCalledWith(formData)
    expect(result).toEqual(mockCreated)
  })

  it('delegates update to mockUpdateOrganizacion', async () => {
    const updateData = { nombre: 'Nombre Actualizado' }
    const mockUpdated = {
      id: 'org-001',
      codigo_cliente: 'ALT-001',
      nombre: 'Nombre Actualizado',
      nombre_comercial: 'Altomayo',
      tipo: TipoEmpresa.EmpresaNacional,
      tamano: TamanoEmpresa.Grande,
      sector: Sector.AGROALIMENTARIA,
      id_author: 1,
      created_at: '2025-01-01T08:00:00Z',
      updated_at: '2025-06-01T08:00:00Z',
    }
    mockUpdateOrganizacion.mockResolvedValueOnce(mockUpdated)

    const result = await organizacionesService.update('org-001', updateData)

    expect(mockUpdateOrganizacion).toHaveBeenCalledWith('org-001', updateData)
    expect(result.nombre).toBe('Nombre Actualizado')
  })

  it('delegates sunatPorRuc to mockSunatPorRuc', async () => {
    const mockResult = { ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.' }
    mockSunatPorRuc.mockResolvedValueOnce(mockResult)

    const result = await organizacionesService.sunatPorRuc('20601258529')

    expect(mockSunatPorRuc).toHaveBeenCalledWith('20601258529')
    expect(result).toEqual(mockResult)
  })

  it('delegates sunatPorNombre to mockSunatPorNombre', async () => {
    const mockResults = [{ ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.' }]
    mockSunatPorNombre.mockResolvedValueOnce(mockResults)

    const result = await organizacionesService.sunatPorNombre('Altomayo')

    expect(mockSunatPorNombre).toHaveBeenCalledWith('Altomayo')
    expect(result).toEqual(mockResults)
  })

  it('delegates getByIdConRelaciones to mockGetOrganizacionConRelaciones', async () => {
    const mockRelaciones = {
      id: 'org-001',
      codigo_cliente: 'ALT-001',
      nombre: 'Altomayo',
      nombre_comercial: 'Altomayo',
      tipo: TipoEmpresa.EmpresaNacional,
      tamano: TamanoEmpresa.Grande,
      sector: Sector.AGROALIMENTARIA,
      id_author: 1,
      created_at: '',
      updated_at: '',
      contactos: [],
      leads: [],
      cotizaciones: [],
    }
    mockGetOrganizacionConRelaciones.mockResolvedValueOnce(mockRelaciones)

    const result = await organizacionesService.getByIdConRelaciones('org-001')

    expect(mockGetOrganizacionConRelaciones).toHaveBeenCalledWith('org-001')
    expect(result.contactos).toEqual([])
    expect(result.leads).toEqual([])
    expect(result.cotizaciones).toEqual([])
  })
})
