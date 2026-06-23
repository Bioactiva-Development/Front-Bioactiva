import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'
import {
  fromOrganizacionDto,
  toCreateOrganizacionDto,
  toUpdateOrganizacionDto,
  toOrganizacionQueryParams,
  fromSunatRucDto,
  fromSunatNombreDto,
  OrganizacionDtoOut,
  SunatRucDto,
} from '@/services/modules/organizaciones.mapper'

/**
 * OrganizacionesMapper
 * --------------------
 * Responsable de:
 * - convertir DTO del backend a modelo de dominio (fromOrganizacionDto)
 * - convertir datos del formulario a DTO de creación (toCreateOrganizacionDto)
 * - convertir datos parciales a DTO de actualización (toUpdateOrganizacionDto)
 * - mapear respuestas SUNAT a modelo de dominio (fromSunatRucDto, fromSunatNombreDto)
 */
// STATUS: Implementación completa.

describe('organizaciones/organizaciones.mapper', () => {
  describe('fromOrganizacionDto', () => {
    const dto: OrganizacionDtoOut = {
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
      actividadEconomica: 'Fabricación de café',
      alianzasEstrategicas: null,
      idContactoActivo: null,
      idAuthor: 1,
      createdAt: '2025-01-01T08:00:00Z',
      updatedAt: '2025-01-01T08:00:00Z',
    }

    it('maps all fields from DTO to domain', () => {
      const result = fromOrganizacionDto(dto)

      expect(result).toEqual({
        id: 'org-001',
        codigo_cliente: 'ALT-001',
        nombre: 'Altomayo',
        nombre_comercial: 'Altomayo',
        sub_area: undefined,
        ruc: '20601258529',
        tipo: TipoEmpresa.EmpresaNacional,
        linkedin: undefined,
        ubicacion: 'Lima, Peru',
        sector: Sector.AGROALIMENTARIA,
        tamano: TamanoEmpresa.Grande,
        actividad_economica: 'Fabricación de café',
        alianzas_estrategicas: undefined,
        id_contacto_activo: undefined,
        id_author: 1,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
      })
    })

    it('maps null optionals to undefined', () => {
      const result = fromOrganizacionDto(dto)
      expect(result.sub_area).toBeUndefined()
      expect(result.linkedin).toBeUndefined()
      expect(result.alianzas_estrategicas).toBeUndefined()
      expect(result.id_contacto_activo).toBeUndefined()
    })

    it('maps null sector to Sector.OTROS', () => {
      const result = fromOrganizacionDto({ ...dto, sector: null })
      expect(result.sector).toBe(Sector.OTROS)
    })

    it('maps null ruc to undefined', () => {
      const result = fromOrganizacionDto({ ...dto, ruc: null })
      expect(result.ruc).toBeUndefined()
    })

    it('maps null ubicacion to undefined', () => {
      const result = fromOrganizacionDto({ ...dto, ubicacion: null })
      expect(result.ubicacion).toBeUndefined()
    })

    it('maps null actividadEconomica to undefined', () => {
      const result = fromOrganizacionDto({ ...dto, actividadEconomica: null })
      expect(result.actividad_economica).toBeUndefined()
    })

    it('falls back to EmpresaNacional for unknown tipo', () => {
      const result = fromOrganizacionDto({ ...dto, tipo: 'UNKNOWN_TYPE' })
      expect(result.tipo).toBe(TipoEmpresa.EmpresaNacional)
    })

    it('falls back to Micro for unknown tamano', () => {
      const result = fromOrganizacionDto({ ...dto, tamano: 'UNKNOWN_SIZE' })
      expect(result.tamano).toBe(TamanoEmpresa.Micro)
    })

    it('maps all backend tipo values', () => {
      const casos: [string, TipoEmpresa][] = [
        ['ACADEMIA', TipoEmpresa.Academia],
        ['EMPRESA_INTERNACIONAL', TipoEmpresa.EmpresaInternacional],
        ['EMPRESA_NACIONAL', TipoEmpresa.EmpresaNacional],
        ['GOBIERNO_NACIONAL', TipoEmpresa.GobiernoNacional],
        ['INDEPENDIENTE', TipoEmpresa.Independiente],
        ['ONG', TipoEmpresa.ONG],
        ['ORGANISMO_INTERNACIONAL', TipoEmpresa.OrganismoInternacional],
      ]
      casos.forEach(([backend, domain]) => {
        expect(fromOrganizacionDto({ ...dto, tipo: backend }).tipo).toBe(domain)
      })
    })

    it('maps all backend tamano values', () => {
      const casos: [string, TamanoEmpresa][] = [
        ['MICRO', TamanoEmpresa.Micro],
        ['PEQUENO', TamanoEmpresa.Pequeno],
        ['MEDIANO', TamanoEmpresa.Mediano],
        ['GRANDE', TamanoEmpresa.Grande],
      ]
      casos.forEach(([backend, domain]) => {
        expect(fromOrganizacionDto({ ...dto, tamano: backend }).tamano).toBe(domain)
      })
    })
  })

  describe('toCreateOrganizacionDto', () => {
    it('converts form data to create DTO with required fields', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Altomayo',
          nombre_comercial: 'Altomayo',
          codigo_cliente: 'ALT-001',
          ruc: '20601258529',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Grande,
          sector: Sector.AGROALIMENTARIA,
        },
        1
      )

      expect(result).toMatchObject({
        codigoCliente: 'ALT-001',
        nombre: 'Altomayo',
        nombreComercial: 'Altomayo',
        tipo: 'EMPRESA_NACIONAL',
        tamano: 'GRANDE',
        idAuthor: 1,
      })
    })

    it('includes optional fields when present', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Test',
          nombre_comercial: 'Test',
          codigo_cliente: 'TST-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
          sector: Sector.OTROS,
          sub_area: 'Innovación',
          ubicacion: 'Lima, Peru',
          linkedin: 'https://linkedin.com/company/test',
          actividad_economica: 'Tecnología',
          alianzas_estrategicas: 'Ninguna',
          id_contacto_activo: 5,
        },
        2
      )

      expect(result).toMatchObject({
        subArea: 'Innovación',
        ubicacion: 'Lima, Peru',
        linkedin: 'https://linkedin.com/company/test',
        sector: 'OTROS',
        actividadEconomica: 'Tecnología',
        alianzasEstrategicas: 'Ninguna',
        idContactoActivo: 5,
        idAuthor: 2,
      })
    })

    it('omits optional fields when empty string', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Test',
          nombre_comercial: 'Test',
          codigo_cliente: 'TST-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
          sector: Sector.OTROS,
          sub_area: '',
          ruc: '',
          linkedin: '',
        },
        1
      )

      expect(result.subArea).toBeUndefined()
      expect(result.ruc).toBeUndefined()
      expect(result.linkedin).toBeUndefined()
    })

    it('uses nombre as fallback for nombreComercial when empty', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Altomayo',
          nombre_comercial: '',
          codigo_cliente: 'ALT-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Grande,
          sector: Sector.AGROALIMENTARIA,
        },
        1
      )

      expect(result.nombreComercial).toBe('Altomayo')
    })

    it('defaults codigo_cliente to empty string when undefined', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Test',
          nombre_comercial: 'Test',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
        },
        1
      )

      expect(result.codigoCliente).toBe('')
    })

    it('omits sector from DTO when not provided', () => {
      const result = toCreateOrganizacionDto(
        {
          nombre: 'Test',
          nombre_comercial: 'Test',
          codigo_cliente: 'TST-001',
          tipo: TipoEmpresa.EmpresaNacional,
          tamano: TamanoEmpresa.Micro,
        },
        1
      )

      expect(result.sector).toBeUndefined()
    })
  })

  describe('toUpdateOrganizacionDto', () => {
    it('only includes provided fields', () => {
      const result = toUpdateOrganizacionDto({ nombre: 'Nuevo Nombre' })

      expect(result).toEqual({ nombre: 'Nuevo Nombre' })
    })

    it('maps optional fields correctly', () => {
      const result = toUpdateOrganizacionDto({
        tipo: TipoEmpresa.ONG,
        tamano: TamanoEmpresa.Pequeno,
        ubicacion: 'Cusco',
      })

      expect(result).toMatchObject({
        tipo: 'ONG',
        tamano: 'PEQUENO',
        ubicacion: 'Cusco',
      })
    })

    it('does not include idAuthor', () => {
      const result = toUpdateOrganizacionDto({ nombre: 'Test' })
      expect(result).not.toHaveProperty('idAuthor')
    })

    it('omits optional fields when they are empty string', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        sub_area: '',
        ruc: '',
        linkedin: '',
        ubicacion: '',
        actividad_economica: '',
        alianzas_estrategicas: '',
      })
      expect(result.subArea).toBeUndefined()
      expect(result.ruc).toBeUndefined()
      expect(result.linkedin).toBeUndefined()
      expect(result.ubicacion).toBeUndefined()
      expect(result.actividadEconomica).toBeUndefined()
      expect(result.alianzasEstrategicas).toBeUndefined()
    })

    it('trims whitespace from optional fields', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        sub_area: '  Innovación  ',
        ruc: '  20601258529  ',
      })
      expect(result.subArea).toBe('Innovación')
      expect(result.ruc).toBe('20601258529')
    })

    it('maps sector from domain to backend value', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        sector: Sector.AGROALIMENTARIA,
      })
      expect(result.sector).toBe('AGROALIMENTARIA')
    })

    it('includes id_contacto_activo when it is 0', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        id_contacto_activo: 0,
      })
      expect(result.idContactoActivo).toBe(0)
    })

    it('omits id_contacto_activo when it is null', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        id_contacto_activo: null,
      })
      expect(result.idContactoActivo).toBeUndefined()
    })

    it('includes codigo_cliente when explicitly provided', () => {
      const result = toUpdateOrganizacionDto({ codigo_cliente: 'ALT-002' })
      expect(result.codigoCliente).toBe('ALT-002')
    })

    it('includes nombre_comercial when explicitly provided', () => {
      const result = toUpdateOrganizacionDto({ nombre_comercial: 'Comercial Test' })
      expect(result.nombreComercial).toBe('Comercial Test')
    })

    it('includes linkedin when explicitly provided', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        linkedin: 'https://linkedin.com/company/test',
      })
      expect(result.linkedin).toBe('https://linkedin.com/company/test')
    })

    it('includes actividad_economica and alianzas_estrategicas when provided', () => {
      const result = toUpdateOrganizacionDto({
        nombre: 'Test',
        actividad_economica: 'Agroindustria',
        alianzas_estrategicas: 'Gobierno Regional',
      })
      expect(result.actividadEconomica).toBe('Agroindustria')
      expect(result.alianzasEstrategicas).toBe('Gobierno Regional')
    })
  })

  describe('fromSunatRucDto', () => {
    const dto: SunatRucDto = {
      ruc: '20601258529',
      razonSocial: 'ALTOMAYO PERU S.A.C.',
      nombreComercial: 'Altomayo',
      ubicacion: 'LIMA',
      actividadEconomica: 'ELABORACION DE CAFE',
    }

    it('maps SUNAT RUC DTO to domain', () => {
      const result = fromSunatRucDto(dto)

      expect(result).toEqual({
        ruc: '20601258529',
        nombre: 'ALTOMAYO PERU S.A.C.',
        nombreCompleto: 'Altomayo',
        ubicacion: 'LIMA',
        estado: undefined,
        condicion: undefined,
        actividades: 'ELABORACION DE CAFE',
      })
    })

    it('uses razonSocial as fallback for nombreCompleto', () => {
      const result = fromSunatRucDto({ ...dto, nombreComercial: undefined })

      expect(result.nombreCompleto).toBe('ALTOMAYO PERU S.A.C.')
    })
  })

  describe('fromSunatNombreDto', () => {
    it('maps SUNAT nombre DTO to domain', () => {
      const result = fromSunatNombreDto({
        ruc: '20601258529',
        razonSocial: 'ALTOMAYO PERU S.A.C.',
        ubicacion: 'LIMA',
      })

      expect(result).toEqual({
        ruc: '20601258529',
        nombre: 'ALTOMAYO PERU S.A.C.',
        ubicacion: 'LIMA',
        estado: undefined,
      })
    })
  })

  describe('toOrganizacionQueryParams', () => {
    it('returns an empty object when there are no filters', () => {
      expect(toOrganizacionQueryParams()).toEqual({})
      expect(toOrganizacionQueryParams({})).toEqual({})
    })

    it('maps search to term and ignores blank search', () => {
      expect(toOrganizacionQueryParams({ search: '  Altomayo  ' })).toEqual({
        term: 'Altomayo',
      })
      expect(toOrganizacionQueryParams({ search: '   ' })).toEqual({})
    })

    it('maps domain enums to backend values', () => {
      expect(
        toOrganizacionQueryParams({
          sector: Sector.TECNOLOGIA,
          tamano: TamanoEmpresa.Pequeno,
          tipo: TipoEmpresa.EmpresaNacional,
        })
      ).toEqual({
        sector: Sector.TECNOLOGIA,
        tamano: 'PEQUENO',
        tipo: 'EMPRESA_NACIONAL',
      })
    })

    it('includes pagination when provided', () => {
      expect(toOrganizacionQueryParams({ page: 2, limit: 20 })).toEqual({
        page: 2,
        limit: 20,
      })
    })
  })
})
