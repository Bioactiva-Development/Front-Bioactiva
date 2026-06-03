import { organizacionSchema } from '@/lib/validators/organizacion.schema'
import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types/enums'

/**
 * OrganizacionSchema
 * ------------------
 * Responsable de:
 * - validar el formulario de creación/edición de organizaciones
 * - campos obligatorios (nombre, nombre_comercial, codigo_cliente, tipo, tamano, sector)
 * - reglas de RUC (11 dígitos, solo números)
 * - longitudes máximas de cada campo
 */
// STATUS: Implementación completa.

const VALID_DATA = {
  nombre: 'Altomayo',
  nombre_comercial: 'Altomayo',
  codigo_cliente: 'ALT-001',
  ruc: '20601258529',
  tipo: TipoEmpresa.Privada,
  tamano: TamanoEmpresa.Grande,
  sector: Sector.AGROALIMENTARIA,
}

describe('organizaciones/organizacion.schema', () => {
  it('accepts valid data', () => {
    expect(organizacionSchema.parse(VALID_DATA)).toEqual(VALID_DATA)
  })

  it('rejects empty nombre', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, nombre: '' })
    ).toThrow('El nombre es obligatorio')
  })

  it('rejects nombre exceeding 120 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, nombre: 'X'.repeat(121) })
    ).toThrow('Maximo 120 caracteres')
  })

  it('rejects empty nombre_comercial', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, nombre_comercial: '' })
    ).toThrow('El nombre comercial es obligatorio')
  })

  it('rejects nombre_comercial exceeding 100 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, nombre_comercial: 'X'.repeat(101) })
    ).toThrow('Máximo 100 caracteres')
  })

  it('rejects RUC with less than 11 digits', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, ruc: '2060125852' })
    ).toThrow('El RUC debe tener 11 dígitos')
  })

  it('rejects RUC with non-digit characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, ruc: '2060125852a' })
    ).toThrow('El RUC debe contener solo números')
  })

  it('accepts empty RUC string (optional)', () => {
    expect(
      organizacionSchema.parse({ ...VALID_DATA, ruc: '' })
    ).toMatchObject({ ruc: '' })
  })

  it('rejects empty codigo_cliente', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, codigo_cliente: '' })
    ).toThrow('El código de cliente es obligatorio')
  })

  it('rejects codigo_cliente exceeding 20 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, codigo_cliente: 'X'.repeat(21) })
    ).toThrow('Máximo de 20 caracteres')
  })

  it('rejects invalid tipo enum', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, tipo: 'INVALID' })
    ).toThrow('El tipo es obligatorio')
  })

  it('rejects invalid tamano enum', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, tamano: 'INVALID' })
    ).toThrow('El tamaño es obligatorio')
  })

  it('rejects invalid sector enum', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, sector: 'INVALID' })
    ).toThrow('El sector es obligatorio')
  })

  it('rejects ubicacion exceeding 200 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, ubicacion: 'X'.repeat(201) })
    ).toThrow('Maximo de 200 caracteres')
  })

  it('rejects actividad_economica exceeding 200 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, actividad_economica: 'X'.repeat(201) })
    ).toThrow('Maximo de 200 caracteres')
  })

  it('rejects linkedin exceeding 255 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, linkedin: 'X'.repeat(256) })
    ).toThrow('Maximo de 255 caracteres')
  })

  it('rejects alianzas_estrategicas exceeding 300 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, alianzas_estrategicas: 'X'.repeat(301) })
    ).toThrow('Maximo de 300 caracteres')
  })

  it('accepts optional fields as undefined', () => {
    const result = organizacionSchema.parse({
      nombre: 'Test',
      nombre_comercial: 'Test',
      codigo_cliente: 'TST-001',
      tipo: TipoEmpresa.Privada,
      tamano: TamanoEmpresa.Micro,
      sector: Sector.OTROS,
    })
    expect(result.nombre).toBe('Test')
    expect(result.codigo_cliente).toBe('TST-001')
    expect(result.tipo).toBe(TipoEmpresa.Privada)
    expect(result.tamano).toBe(TamanoEmpresa.Micro)
    expect(result.sector).toBe(Sector.OTROS)
  })

  it('accepts sub_area up to 20 characters', () => {
    expect(
      organizacionSchema.parse({ ...VALID_DATA, sub_area: 'Innovación' })
    ).toMatchObject({ sub_area: 'Innovación' })
  })

  it('rejects sub_area exceeding 20 characters', () => {
    expect(() =>
      organizacionSchema.parse({ ...VALID_DATA, sub_area: 'X'.repeat(21) })
    ).toThrow('Maximo de 20 caracteres')
  })

  it('parses all TipoEmpresa values', () => {
    Object.values(TipoEmpresa).forEach((tipo) => {
      expect(
        organizacionSchema.parse({ ...VALID_DATA, tipo })
      ).toMatchObject({ tipo })
    })
  })

  it('parses all TamanoEmpresa values', () => {
    Object.values(TamanoEmpresa).forEach((tamano) => {
      expect(
        organizacionSchema.parse({ ...VALID_DATA, tamano })
      ).toMatchObject({ tamano })
    })
  })
})
