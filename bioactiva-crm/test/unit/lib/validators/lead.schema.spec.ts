import { leadSchema } from '@/lib/validators/lead.schema'
import { LeadState } from '@/types/enums'

describe('validators/lead.schema', () => {
  it('accepts valid lead data with only required fields', () => {
    const result = leadSchema.parse({
      id_org: 'org-001',
      servicio_interes: 'Ley 30309',
      id_encargado: 3,
      estado: LeadState.Prospecto,
    })
    expect(result.id_org).toBe('org-001')
    expect(result.estado).toBe(LeadState.Prospecto)
  })

  it('accepts valid lead data with all optional fields', () => {
    const result = leadSchema.parse({
      id_org: 'org-001',
      servicio_interes: 'Deducción I+D+i',
      id_encargado: 3,
      estado: LeadState.Ofertado,
      id_contacto: 4,
      comentarios: 'Cliente interesado',
      desafio_oportunidad: 'Optimizar procesos',
      notas_contacto: 'Llamar en una semana',
      canal_captacion: 'Referido',
      fecha_cierre: '2026-07-15',
      encargado_correo: 'admin@bioactiva.pe',
    })
    expect(result.comentarios).toBe('Cliente interesado')
    expect(result.fecha_cierre).toBe('2026-07-15')
  })

  it('rejects missing organization', () => {
    expect(() =>
      leadSchema.parse({
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
      })
    ).toThrow()
  })

  it('rejects empty organization', () => {
    expect(() =>
      leadSchema.parse({
        id_org: '',
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
      })
    ).toThrow('La organización es obligatoria')
  })

  it('rejects empty servicio_interes', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: '',
        id_encargado: 3,
        estado: LeadState.Prospecto,
      })
    ).toThrow('El servicio de interés es obligatorio')
  })

  it('rejects servicio_interes exceeding 120 characters', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'X'.repeat(121),
        id_encargado: 3,
        estado: LeadState.Prospecto,
      })
    ).toThrow('Máximo 120 caracteres')
  })

  it('rejects missing encargado', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Ley 30309',
        estado: LeadState.Prospecto,
      })
    ).toThrow()
  })

  it('accepts empty optional strings', () => {
    const result = leadSchema.parse({
      id_org: 'org-001',
      servicio_interes: 'Ley 30309',
      id_encargado: 3,
      estado: LeadState.Prospecto,
      comentarios: '',
      desafio_oportunidad: '',
      notas_contacto: '',
      canal_captacion: '',
      fecha_cierre: '',
    })
    expect(result.comentarios).toBe('')
  })

  it('rejects comentarios exceeding 500 characters', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
        comentarios: 'X'.repeat(501),
      })
    ).toThrow('Máximo 500 caracteres')
  })

  it('rejects notas_contacto exceeding 1000 characters', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
        notas_contacto: 'X'.repeat(1001),
      })
    ).toThrow('Máximo 1000 caracteres')
  })

  it('rejects invalid email in encargado_correo', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Ley 30309',
        id_encargado: 3,
        estado: LeadState.Prospecto,
        encargado_correo: 'invalid-email',
      })
    ).toThrow('Ingrese un correo válido')
  })

  it('accepts all LeadState enum values', () => {
    const states = [
      LeadState.Prospecto,
      LeadState.Ofertado,
      LeadState.CierreVenta,
      LeadState.CierreSinVenta,
    ]
    for (const estado of states) {
      const result = leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado,
      })
      expect(result.estado).toBe(estado)
    }
  })
})
