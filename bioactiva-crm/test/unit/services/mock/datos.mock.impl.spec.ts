import {
  mockPreviewImport,
  mockConfirmarImport,
  mockExportar,
  mockContarExportacion,
} from '@/services/mock/datos.mock'

describe('mocks/datos.mock (implementation)', () => {
  describe('mockPreviewImport', () => {
    it('returns preview for organizaciones', async () => {
      const result = await mockPreviewImport('organizaciones')
      expect(result).toHaveProperty('entidad')
      expect(result).toHaveProperty('registros')
      expect(result.registros.length).toBeGreaterThan(0)
    })

    it('returns preview for contactos', async () => {
      const result = await mockPreviewImport('contactos')
      expect(result.entidad).toBe('contactos')
    })

    it('returns preview for leads', async () => {
      const result = await mockPreviewImport('leads')
      expect(result.entidad).toBe('leads')
    })
  })

  describe('mockConfirmarImport', () => {
    it('returns confirmation result', async () => {
      const result = await mockConfirmarImport('contactos')
      expect(result).toHaveProperty('exitosos')
      expect(result).toHaveProperty('errores')
      expect(result).toHaveProperty('mensaje')
    })
  })

  describe('mockExportar', () => {
    it('returns export data with filtros object', async () => {
      const result = await mockExportar({ entidad: 'organizaciones', busqueda: '', filtros: {} } as any)
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('columnas')
      expect(result).toHaveProperty('total')
    })
  })

  describe('mockContarExportacion', () => {
    it('returns count with filtros object', async () => {
      const result = await mockContarExportacion({ entidad: 'leads', busqueda: '', filtros: {} } as any)
      expect(result).toHaveProperty('total')
    })
  })
})
