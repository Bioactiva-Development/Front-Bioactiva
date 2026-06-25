import { leadSchema, createLeadSchema } from '@/lib/validators/lead.schema'
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
      canal_captacion: 'Referido',
      fecha_cierre: '2026-07-15',
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
      canal_captacion: '',
      fecha_cierre: '',
    })
    expect(result.comentarios).toBe('')
  })

  it('rejects encargado with value 0', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 0,
        estado: LeadState.Prospecto,
      })
    ).toThrow('El encargado es obligatorio')
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

  it('rejects canal_captacion exceeding 60 characters', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado: LeadState.Prospecto,
        canal_captacion: 'X'.repeat(61),
      })
    ).toThrow('Máximo 60 caracteres')
  })

  it('rejects desafio_oportunidad exceeding 500 characters', () => {
    expect(() =>
      leadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado: LeadState.Prospecto,
        desafio_oportunidad: 'X'.repeat(501),
      })
    ).toThrow('Máximo 500 caracteres')
  })

  describe('createLeadSchema', () => {
    it('accepts valid future date', () => {
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const y = future.getFullYear()
      const m = String(future.getMonth() + 1).padStart(2, '0')
      const d = String(future.getDate()).padStart(2, '0')
      const result = createLeadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado: LeadState.Prospecto,
        fecha_cierre: `${y}-${m}-${d}`,
      })
      expect(result.fecha_cierre).toBe(`${y}-${m}-${d}`)
    })

    it('accepts empty fecha_cierre', () => {
      const result = createLeadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado: LeadState.Prospecto,
        fecha_cierre: '',
      })
      expect(result.fecha_cierre).toBe('')
    })

    it('rejects past fecha_cierre', () => {
      const past = new Date()
      past.setDate(past.getDate() - 5)
      const y = past.getFullYear()
      const m = String(past.getMonth() + 1).padStart(2, '0')
      const d = String(past.getDate()).padStart(2, '0')
      expect(() =>
        createLeadSchema.parse({
          id_org: 'org-001',
          servicio_interes: 'Test',
          id_encargado: 1,
          estado: LeadState.Prospecto,
          fecha_cierre: `${y}-${m}-${d}`,
        })
      ).toThrow('No se permite establecer fechas pasadas')
    })

    it('accepts fecha_cierre from today (today is not in the past)', () => {
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const result = createLeadSchema.parse({
        id_org: 'org-001',
        servicio_interes: 'Test',
        id_encargado: 1,
        estado: LeadState.Prospecto,
        fecha_cierre: `${y}-${m}-${d}`,
      })
      expect(result.fecha_cierre).toBe(`${y}-${m}-${d}`)
    })
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
