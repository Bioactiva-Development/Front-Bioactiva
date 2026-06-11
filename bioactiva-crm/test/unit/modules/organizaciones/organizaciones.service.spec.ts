/**
 * OrganizacionesService — modo API real
 * --------------------------------------
 * Responsable de:
 * - listar, obtener, crear, actualizar organizaciones
 * - consultar SUNAT por RUC y por nombre
 * - obtener organización con relaciones
 * - filtrado y paginación client-side
 * - manejo de errores (404, 409)
 */
// STATUS: Implementación completa.

jest.mock('@/lib/constants/config', () => ({
  USE_MOCK: false,
}))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
  },
}))

import { organizacionesService } from '@/services/modules/organizaciones.service'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'

describe('organizaciones/organizaciones.service (API mode)', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
  })

  describe('getAll', () => {
    const dtoArray = [
      {
        id: 'org-001',
        codigoCliente: 'ALT-001',
        nombre: 'Altomayo',
        nombreComercial: 'Altomayo',
        subArea: null,
        ruc: '20601258529',
        tipo: 'EMPRESA_NACIONAL',
        linkedin: null,
        ubicacion: 'Lima, Peru',
        sector: 'AGROALIMENTARIA',
        tamano: 'GRANDE',
        actividadEconomica: 'Café',
        alianzasEstrategicas: null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-01-01T08:00:00Z',
      },
      {
        id: 'org-002',
        codigoCliente: 'ORG-2026-002',
        nombre: 'Cacao de Aroma',
        nombreComercial: 'Cacao de Aroma',
        subArea: null,
        ruc: '20524967627',
        tipo: 'EMPRESA_NACIONAL',
        linkedin: null,
        ubicacion: 'San Martín, Peru',
        sector: 'AGROALIMENTARIA',
        tamano: 'MEDIANO',
        actividadEconomica: 'Cacao',
        alianzasEstrategicas: null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: '2025-01-05T08:00:00Z',
        updatedAt: '2025-01-05T08:00:00Z',
      },
    ]

    it('fetches all organizations and maps them', async () => {
      getMock.mockResolvedValueOnce({ data: dtoArray })

      const result = await organizacionesService.getAll()

      expect(getMock).toHaveBeenCalledWith('/organizations')
      expect(result.data).toHaveLength(2)
      expect(result.data[0].codigo_cliente).toBe('ALT-001')
      expect(result.data[0].tipo).toBe(TipoEmpresa.Privada)
      expect(result.data[0].tamano).toBe(TamanoEmpresa.Grande)
    })

    it('filters by search', async () => {
      getMock.mockResolvedValueOnce({ data: dtoArray })

      const result = await organizacionesService.getAll({ search: 'cacao' })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('org-002')
    })

    it('filters by sector', async () => {
      getMock.mockResolvedValueOnce({ data: dtoArray })

      const result = await organizacionesService.getAll({ sector: Sector.AGROALIMENTARIA })

      expect(result.data).toHaveLength(2)
    })

    it('returns empty array when no match', async () => {
      getMock.mockResolvedValueOnce({ data: dtoArray })

      const result = await organizacionesService.getAll({ search: 'nonexistent' })

      expect(result.data).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('paginates results', async () => {
      getMock.mockResolvedValueOnce({ data: dtoArray })

      const result = await organizacionesService.getAll({ page: 1, limit: 1 })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(1)
    })
  })

  describe('getById', () => {
    const dto = {
      id: 'org-001',
      codigoCliente: 'ALT-001',
      nombre: 'Altomayo',
      nombreComercial: 'Altomayo',
      subArea: null,
      ruc: '20601258529',
      tipo: 'EMPRESA_NACIONAL',
      linkedin: null,
      ubicacion: 'Lima, Peru',
      sector: 'AGROALIMENTARIA',
      tamano: 'GRANDE',
      actividadEconomica: 'Café',
      alianzasEstrategicas: null,
      idContactoActivo: null,
      idAuthor: 1,
      createdAt: '2025-01-01T08:00:00Z',
      updatedAt: '2025-01-01T08:00:00Z',
    }

    it('fetches organization by id', async () => {
      getMock.mockResolvedValueOnce({ data: dto })

      const result = await organizacionesService.getById('org-001')

      expect(getMock).toHaveBeenCalledWith('/organizations/org-001')
      expect(result.nombre).toBe('Altomayo')
      expect(result.tipo).toBe(TipoEmpresa.Privada)
    })

    it('throws when organization not found', async () => {
      getMock.mockRejectedValueOnce({ status: 404, message: 'Organización no encontrada.' })

      await expect(organizacionesService.getById('nonexistent')).rejects.toMatchObject({
        status: 404,
      })
    })
  })

  describe('create', () => {
    it('posts create payload and returns mapped organization', async () => {
      const createdDto = {
        id: 'org-007',
        codigoCliente: 'ALT-001',
        nombre: 'Altomayo',
        nombreComercial: 'Altomayo',
        subArea: null,
        ruc: '20601258529',
        tipo: 'EMPRESA_NACIONAL',
        linkedin: null,
        ubicacion: 'Lima, Peru',
        sector: 'AGROALIMENTARIA',
        tamano: 'GRANDE',
        actividadEconomica: 'Café',
        alianzasEstrategicas: null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: '2025-06-01T08:00:00Z',
        updatedAt: '2025-06-01T08:00:00Z',
      }
      postMock.mockResolvedValueOnce({ data: createdDto })

      const result = await organizacionesService.create(
        {
          nombre: 'Altomayo',
          nombre_comercial: 'Altomayo',
          codigo_cliente: 'ALT-001',
          tipo: TipoEmpresa.Privada,
          tamano: TamanoEmpresa.Grande,
          sector: Sector.AGROALIMENTARIA,
        },
        1
      )

      expect(postMock).toHaveBeenCalledWith(
        '/organizations',
        expect.objectContaining({
          codigoCliente: 'ALT-001',
          nombre: 'Altomayo',
          tipo: 'EMPRESA_NACIONAL',
          idAuthor: 1,
        })
      )
      expect(result.id).toBe('org-007')
    })
  })

  describe('update', () => {
    it('patches organization and returns updated data', async () => {
      const updatedDto = {
        id: 'org-001',
        codigoCliente: 'ALT-001',
        nombre: 'Altomayo Updated',
        nombreComercial: 'Altomayo',
        subArea: null,
        ruc: '20601258529',
        tipo: 'EMPRESA_NACIONAL',
        linkedin: null,
        ubicacion: 'Lima, Peru',
        sector: 'AGROALIMENTARIA',
        tamano: 'GRANDE',
        actividadEconomica: 'Café',
        alianzasEstrategicas: null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-06-01T08:00:00Z',
      }
      patchMock.mockResolvedValueOnce({ data: updatedDto })

      const result = await organizacionesService.update('org-001', { nombre: 'Altomayo Updated' })

      expect(patchMock).toHaveBeenCalledWith(
        '/organizations/org-001',
        { nombre: 'Altomayo Updated' }
      )
      expect(result.nombre).toBe('Altomayo Updated')
    })
  })

  describe('sunatPorRuc', () => {
    it('fetches SUNAT by RUC', async () => {
      getMock.mockResolvedValueOnce({
        data: {
          ruc: '20601258529',
          razonSocial: 'ALTOMAYO PERU S.A.C.',
          ubicacion: 'LIMA',
        },
      })

      const result = await organizacionesService.sunatPorRuc('20601258529')

      expect(getMock).toHaveBeenCalledWith('/organizations/sunat', { params: { query: '20601258529' }, timeout: 30000 })
      expect(result.ruc).toBe('20601258529')
      expect(result.nombre).toBe('ALTOMAYO PERU S.A.C.')
    })
  })

  describe('sunatPorNombre', () => {
    it('fetches SUNAT by business name', async () => {
      getMock.mockResolvedValueOnce({
        data: [
          { ruc: '20601258529', razonSocial: 'ALTOMAYO PERU S.A.C.', ubicacion: 'LIMA' },
        ],
      })

      const result = await organizacionesService.sunatPorNombre('Altomayo')

      expect(getMock).toHaveBeenCalledWith('/organizations/sunat', { params: { query: 'Altomayo' }, timeout: 30000 })
      expect(result).toHaveLength(1)
      expect(result[0].ruc).toBe('20601258529')
    })

    it('re-routes to sunatPorRuc when input is an RUC', async () => {
      getMock.mockResolvedValueOnce({
        data: {
          ruc: '20601258529',
          razonSocial: 'ALTOMAYO PERU S.A.C.',
          ubicacion: 'LIMA',
        },
      })

      const result = await organizacionesService.sunatPorNombre('20601258529')

      expect(getMock).toHaveBeenCalledWith('/organizations/sunat', { params: { query: '20601258529' }, timeout: 30000 })
      expect(result).toHaveLength(1)
    })

    it('truncates results to 10', async () => {
      const manyResults = Array.from({ length: 15 }, (_, i) => ({
        ruc: `${20100000000 + i}`,
        razonSocial: `Empresa ${i}`,
      }))
      getMock.mockResolvedValueOnce({ data: manyResults })

      const result = await organizacionesService.sunatPorNombre('Empresa')

      expect(result).toHaveLength(10)
    })
  })

  describe('getByIdConRelaciones', () => {
    it('returns organization with empty relations in API mode', async () => {
      const dto = {
        id: 'org-001',
        codigoCliente: 'ALT-001',
        nombre: 'Altomayo',
        nombreComercial: 'Altomayo',
        subArea: null,
        ruc: '20601258529',
        tipo: 'EMPRESA_NACIONAL',
        linkedin: null,
        ubicacion: 'Lima, Peru',
        sector: 'AGROALIMENTARIA',
        tamano: 'GRANDE',
        actividadEconomica: 'Café',
        alianzasEstrategicas: null,
        idContactoActivo: null,
        idAuthor: 1,
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-01-01T08:00:00Z',
      }
      getMock.mockResolvedValueOnce({ data: dto })
      getMock.mockResolvedValueOnce({ data: [] })
      getMock.mockResolvedValueOnce({ data: { data: [] } })
      getMock.mockResolvedValueOnce({ data: { data: [] } })

      const result = await organizacionesService.getByIdConRelaciones('org-001')

      expect(result.contactos).toEqual([])
      expect(result.leads).toEqual([])
      expect(result.cotizaciones).toEqual([])
    })
  })
})
