import { generarCodigoCliente, formatTipo, formatSector, formatTamano } from '@/lib/utils/organizacion.utils'

/**
 * OrganizacionUtils
 * -----------------
 * Responsable de:
 * - generar código de cliente a partir de nombre comercial y RUC
 * - manejar stopwords (DE, DEL, SAC, SRL, etc.)
 * - manejar normalización (acentos, mayúsculas)
 * - manejar fallbacks (sin nombre, sin RUC)
 */
// STATUS: Implementación completa.

describe('organizaciones/organizacion.utils', () => {
  describe('formatTipo', () => {
    it('formats EMPRESA_NACIONAL to Empresa nacional', () => {
      expect(formatTipo('EMPRESA_NACIONAL')).toBe('Empresa nacional')
    })
    it('formats EMPRESA_INTERNACIONAL to Empresa internacional', () => {
      expect(formatTipo('EMPRESA_INTERNACIONAL')).toBe('Empresa internacional')
    })
    it('returns unknown tipo as-is', () => {
      expect(formatTipo('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('formatSector', () => {
    it('formats BANCA_Y_SEGUROS to Banca y seguros', () => {
      expect(formatSector('BANCA_Y_SEGUROS')).toBe('Banca y seguros')
    })
    it('formats AGROALIMENTARIA to Agroalimentaria', () => {
      expect(formatSector('AGROALIMENTARIA')).toBe('Agroalimentaria')
    })
  })

  describe('formatTamano', () => {
    it('formats Pequeno to Pequeño', () => {
      expect(formatTamano('Pequeno')).toBe('Pequeño')
    })
    it('formats Grande to Grande', () => {
      expect(formatTamano('Grande')).toBe('Grande')
    })
    it('returns unknown tamano as-is', () => {
      expect(formatTamano('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('generarCodigoCliente', () => {
    it('generates code from two significant words', () => {
      expect(generarCodigoCliente('Cacao de Aroma', '20123456550')).toBe('CA-550')
    })

    it('generates code from single significant word', () => {
      expect(generarCodigoCliente('Altomayo', '20100070970')).toBe('ALT-970')
    })

    it('ignores stopwords like DE, DEL, SAC', () => {
      expect(generarCodigoCliente('Inversiones Pisco S.A.', '20123456789')).toBe('IPS-789')
    })

    it('handles multiple stopwords', () => {
      expect(generarCodigoCliente('Corporacion Grupo La Empresa SAC', '20123456001')).toBe('COR-001')
    })

    it('uses ORG fallback when no words remain', () => {
      expect(generarCodigoCliente('', '20123456550')).toBe('ORG-550')
    })

    it('uses 000 fallback when no RUC provided', () => {
      expect(generarCodigoCliente('Altomayo')).toBe('ALT-000')
    })

    it('normalizes accents correctly', () => {
      const code = generarCodigoCliente('Inversión Tecnológica del Perú', '20123456999')
      expect(code).toBe('ITP-999')
    })

    it('truncates initials to 4 characters max', () => {
      expect(generarCodigoCliente('ABCD EFGH IJKL MNOP QRST', '20123456111')).toBe('AEIM-111')
    })

    it('handles undefined nombreComercial', () => {
      expect(generarCodigoCliente(undefined, '20123456550')).toBe('ORG-550')
    })

    it('handles non-numeric RUC characters', () => {
      expect(generarCodigoCliente('Altomayo', 'ABC20100070970XYZ')).toBe('ALT-970')
    })

    it('uppercases the result', () => {
      const code = generarCodigoCliente('cacao de aroma', '20123456550')
      expect(code).toBe('CA-550')
      expect(code).toEqual(code.toUpperCase())
    })
  })
})
