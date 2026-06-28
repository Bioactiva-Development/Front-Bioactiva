import { contactoSchema } from '@/lib/validators/contacto.schema'
import { Vocativo } from '@/types/enums'

const VALID_DATA = {
  nombres: 'Ricardo',
  apellidos: 'Perales Tuesta',
  vocativo: Vocativo.SR,
  cargo: 'Gerente de Proyectos',
  correo: 'rperales@altomayo.com.pe',
  correo2: 'rperales2@altomayo.com.pe',
  telefono: '997654321',
  comentarios: 'Contacto principal',
  idOrganizacion: 'org-001',
}

describe('contactos/contacto.schema', () => {
  it('accepts valid data', () => {
    expect(contactoSchema.parse(VALID_DATA)).toEqual(VALID_DATA)
  })

  it('rejects empty nombres', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, nombres: '' })
    ).toThrow('El nombre es obligatorio')
  })

  it('rejects nombres exceeding 90 characters', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, nombres: 'X'.repeat(91) })
    ).toThrow('Máximo 90 caracteres')
  })

  it('rejects invalid email format', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, correo: 'not-an-email' })
    ).toThrow('Ingrese un correo válido')
  })

  it('rejects empty correo', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, correo: '' })
    ).toThrow('El correo es obligatorio')
  })

  it('rejects correo exceeding 254 characters', () => {
    expect(() =>
      contactoSchema.parse({
        ...VALID_DATA,
        correo: `a@${'x'.repeat(250)}.com`,
      })
    ).toThrow('Máximo 254 caracteres')
  })

  it('accepts optional apellidos as empty string', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, apellidos: '' })
    ).toMatchObject({ apellidos: '' })
  })

  it('rejects missing vocativo', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, vocativo: undefined })
    ).toThrow('El campo Vocativo es obligatorio')
  })

  it('accepts valid vocativo values', () => {
    Object.values(Vocativo).forEach((v) => {
      expect(
        contactoSchema.parse({ ...VALID_DATA, vocativo: v })
      ).toMatchObject({ vocativo: v })
    })
  })

  it('accepts optional cargo as empty string', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, cargo: '' })
    ).toMatchObject({ cargo: '' })
  })

  it('rejects cargo exceeding 120 characters', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, cargo: 'X'.repeat(121) })
    ).toThrow('Máximo 120 caracteres')
  })

  it('accepts optional correo2 as empty string', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, correo2: '' })
    ).toMatchObject({ correo2: '' })
  })

  it('rejects correo2 with invalid email', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, correo2: 'bad-email' })
    ).toThrow('Ingrese un correo válido')
  })

  it('accepts optional telefono as empty string', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, telefono: '' })
    ).toMatchObject({ telefono: '' })
  })

  it('rejects telefono exceeding 15 digits', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, telefono: '1234567890123456' })
    ).toThrow('Ingresa solo los dígitos del número (sin código de país)')
  })

  it('accepts telefono with 9 digits (no prefix)', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, telefono: '987654321' })
    ).toMatchObject({ telefono: '987654321' })
  })

  it('rejects telefono with parentheses', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, telefono: '+(51)987654321' })
    ).toThrow('Ingresa solo los dígitos del número (sin código de país)')
  })

  it('accepts optional comentarios as empty string', () => {
    expect(
      contactoSchema.parse({ ...VALID_DATA, comentarios: '' })
    ).toMatchObject({ comentarios: '' })
  })

  it('rejects comentarios exceeding 500 characters', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, comentarios: 'X'.repeat(501) })
    ).toThrow('Máximo 500 caracteres')
  })

  it('rejects empty idOrganizacion', () => {
    expect(() =>
      contactoSchema.parse({ ...VALID_DATA, idOrganizacion: '' })
    ).toThrow('La organización es obligatoria')
  })

  it('accepts minimal valid data (only required fields)', () => {
    const result = contactoSchema.parse({
      nombres: 'Juan',
      correo: 'juan@example.com',
      idOrganizacion: 'org-001',
      vocativo: Vocativo.SR,
    })
    expect(result.nombres).toBe('Juan')
    expect(result.correo).toBe('juan@example.com')
    expect(result.idOrganizacion).toBe('org-001')
    expect(result.vocativo).toBe(Vocativo.SR)
  })
})
