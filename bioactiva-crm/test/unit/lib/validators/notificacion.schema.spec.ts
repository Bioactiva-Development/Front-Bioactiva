import {
  recordatorioSchema,
  seguimientoSchema,
} from '@/lib/validators/notificacion.schema'

describe('notificacion schemas', () => {
  it.each([15, 30, 60])('accepts the supported reminder time %i', (minutosAntes) => {
    const result = recordatorioSchema.parse({
      idLead: 10,
      minutosAntes,
      idTemplate: 0,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    })
    expect(result.minutosAntes).toBe(minutosAntes)
  })

  it('rejects custom reminder times', () => {
    expect(() => recordatorioSchema.parse({
      idLead: 10,
      minutosAntes: 45,
      idTemplate: 0,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    })).toThrow('Seleccione 15 minutos, 30 minutos o 1 hora')
  })

  it('rejects unsupported reminder times', () => {
    expect(() => recordatorioSchema.parse({
      idLead: 10,
      minutosAntes: 121,
      idTemplate: 0,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    })).toThrow('Seleccione 15 minutos, 30 minutos o 1 hora')
  })

  const instancia = {
    internal: {
      minutosAntes: 60,
      idTemplate: 0,
      asunto: 'Interno',
      cuerpo: 'Preparar',
    },
    external: {
      minutosAntes: 30,
      idTemplate: 0,
      asunto: 'Cliente',
      cuerpo: 'Seguimiento',
    },
  }

  it('accepts a single chronological follow-up instance', () => {
    const result = seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [instancia],
    })
    expect(result.instancias).toHaveLength(1)
  })

  it('rejects more than one follow-up instance', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [
        instancia,
        {
          internal: { ...instancia.internal, minutosAntes: 60 },
          external: { ...instancia.external, minutosAntes: 15 },
        },
      ],
    })).toThrow('El seguimiento debe tener exactamente una instancia')
  })

  it('rejects unsupported follow-up anticipation', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        internal: { ...instancia.internal, minutosAntes: 45 },
      }],
    })).toThrow('Seleccione 15 minutos, 30 minutos o 1 hora')
  })

  it('requires more anticipation for the internal email', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        internal: { ...instancia.internal, minutosAntes: 30 },
        external: { ...instancia.external, minutosAntes: 60 },
      }],
    })).toThrow(
      'El correo interno debe tener más anticipación que el correo al cliente'
    )
  })
})
