import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'
import {
  fromOrganizacionDto,
  toCreateOrganizacionDto,
  toUpdateOrganizacionDto,
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
        tipo: TipoEmpresa.Privada,
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

    it('falls back to Privada for unknown tipo', () => {
      const result = fromOrganizacionDto({ ...dto, tipo: 'UNKNOWN_TYPE' })
      expect(result.tipo).toBe(TipoEmpresa.Privada)
    })

    it('falls back to Micro for unknown tamano', () => {
      const result = fromOrganizacionDto({ ...dto, tamano: 'UNKNOWN_SIZE' })
      expect(result.tamano).toBe(TamanoEmpresa.Micro)
    })

    it('maps all backend tipo values', () => {
      const casos: [string, TipoEmpresa][] = [
        ['ACADEMIA', TipoEmpresa.Publica],
        ['EMPRESA_INTERNACIONAL', TipoEmpresa.Privada],
        ['EMPRESA_NACIONAL', TipoEmpresa.Privada],
        ['GOBIERNO_NACIONAL', TipoEmpresa.Publica],
        ['INDEPENDIENTE', TipoEmpresa.Privada],
        ['ONG', TipoEmpresa.ONG],
        ['ORGANISMO_INTERNACIONAL', TipoEmpresa.Mixta],
      ]
      casos.forEach(([backend, domain]) => {
        expect(fromOrganizacionDto({ ...dto, tipo: backend }).tipo).toBe(domain)
      })
    })

    it('maps all backend tamano values', () => {
      const casos: [string, TamanoEmpresa][] = [
        ['MICRO', TamanoEmpresa.Micro],
        ['PEQUENO', TamanoEmpresa.Pequena],
        ['MEDIANO', TamanoEmpresa.Mediana],
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
          tipo: TipoEmpresa.Privada,
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
          tipo: TipoEmpresa.Privada,
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
          tipo: TipoEmpresa.Privada,
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
          tipo: TipoEmpresa.Privada,
          tamano: TamanoEmpresa.Grande,
          sector: Sector.AGROALIMENTARIA,
        },
        1
      )

      expect(result.nombreComercial).toBe('Altomayo')
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
        tamano: TamanoEmpresa.Pequena,
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
})
