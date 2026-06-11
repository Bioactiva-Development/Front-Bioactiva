import { plantillaSchema } from '@/lib/validators/plantilla.schema'

describe('validators/plantilla.schema', () => {
  it('accepts valid plantilla data', () => {
    const result = plantillaSchema.parse({
      nombre: 'Plantilla de seguimiento',
      asunto: 'Seguimiento de cotización',
      cuerpo: '<p>Estimado cliente, adjuntamos la cotización.</p>',
    })
    expect(result.nombre).toBe('Plantilla de seguimiento')
    expect(result.activo).toBeUndefined()
  })

  it('accepts valid data with activo flag', () => {
    const result = plantillaSchema.parse({
      nombre: 'Plantilla de bienvenida',
      asunto: 'Bienvenido a BioActiva',
      cuerpo: '<p>Bienvenido a nuestro sistema.</p>',
      activo: true,
    })
    expect(result.activo).toBe(true)
  })

  it('rejects empty nombre', () => {
    expect(() =>
      plantillaSchema.parse({
        nombre: '',
        asunto: 'Seguimiento',
        cuerpo: 'Cuerpo del mensaje',
      })
    ).toThrow('El nombre es obligatorio')
  })

  it('rejects nombre exceeding 100 characters', () => {
    expect(() =>
      plantillaSchema.parse({
        nombre: 'X'.repeat(101),
        asunto: 'Seguimiento',
        cuerpo: 'Cuerpo del mensaje',
      })
    ).toThrow('Máximo 100 caracteres')
  })

  it('rejects empty asunto', () => {
    expect(() =>
      plantillaSchema.parse({
        nombre: 'Plantilla',
        asunto: '',
        cuerpo: 'Cuerpo del mensaje',
      })
    ).toThrow('El asunto es obligatorio')
  })

  it('rejects asunto exceeding 255 characters', () => {
    expect(() =>
      plantillaSchema.parse({
        nombre: 'Plantilla',
        asunto: 'X'.repeat(256),
        cuerpo: 'Cuerpo del mensaje',
      })
    ).toThrow('Máximo 255 caracteres')
  })

  it('rejects empty cuerpo', () => {
    expect(() =>
      plantillaSchema.parse({
        nombre: 'Plantilla',
        asunto: 'Asunto',
        cuerpo: '',
      })
    ).toThrow('El cuerpo del mensaje es obligatorio')
  })
})
