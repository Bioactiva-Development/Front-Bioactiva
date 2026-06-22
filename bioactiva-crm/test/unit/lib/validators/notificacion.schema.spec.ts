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
      fechaEnvio: '2026-06-20',
      horaEnvio: '10:00',
      idTemplate: 0,
      asunto: 'Interno',
      cuerpo: 'Preparar',
    },
    external: {
      fechaEnvio: '2026-06-20',
      horaEnvio: '11:00',
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
          internal: { ...instancia.internal, horaEnvio: '12:00' },
          external: { ...instancia.external, horaEnvio: '13:00' },
        },
      ],
    })).toThrow('El seguimiento debe tener exactamente una instancia')
  })

  it('requires a valid follow-up send date and time', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        internal: { ...instancia.internal, fechaEnvio: '', horaEnvio: '' },
      }],
    })).toThrow('La fecha de envío es obligatoria')
  })

  it('requires the user email to be sent before the contact email', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        internal: { ...instancia.internal, horaEnvio: '11:00' },
        external: { ...instancia.external, horaEnvio: '10:00' },
      }],
    })).toThrow(
      'La fecha y hora de envío para el usuario debe ser anterior a la fecha y hora de envío para el contacto'
    )
  })

  it('rejects equal send date-times for user and contact', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        external: { ...instancia.external, horaEnvio: '10:00' },
      }],
    })).toThrow(
      'La fecha y hora de envío para el usuario debe ser anterior a la fecha y hora de envío para el contacto'
    )
  })
})
