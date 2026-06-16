import {
  recordatorioSchema,
  seguimientoSchema,
} from '@/lib/validators/notificacion.schema'

describe('notificacion schemas', () => {
  it('accepts a reminder with 1 to 120 minutes', () => {
    const result = recordatorioSchema.parse({
      idLead: 10,
      minutosAntes: 30,
      idTemplate: 0,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    })
    expect(result.idLead).toBe(10)
  })

  it('rejects reminders outside the documented range', () => {
    expect(() => recordatorioSchema.parse({
      idLead: 10,
      minutosAntes: 121,
      idTemplate: 0,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    })).toThrow('El máximo es 120 minutos')
  })

  const instancia = {
    internal: {
      fechaEnvio: '2026-06-20T10:00',
      idTemplate: 0,
      asunto: 'Interno',
      cuerpo: 'Preparar',
    },
    external: {
      fechaEnvio: '2026-06-20T11:00',
      idTemplate: 0,
      asunto: 'Cliente',
      cuerpo: 'Seguimiento',
    },
  }

  it('accepts one to three chronological follow-up instances', () => {
    const result = seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [instancia],
    })
    expect(result.instancias).toHaveLength(1)
  })

  it('rejects more than three follow-up instances', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [
        instancia,
        {
          internal: { ...instancia.internal, fechaEnvio: '2026-06-20T12:00' },
          external: { ...instancia.external, fechaEnvio: '2026-06-20T13:00' },
        },
        {
          internal: { ...instancia.internal, fechaEnvio: '2026-06-20T14:00' },
          external: { ...instancia.external, fechaEnvio: '2026-06-20T15:00' },
        },
        {
          internal: { ...instancia.internal, fechaEnvio: '2026-06-20T16:00' },
          external: { ...instancia.external, fechaEnvio: '2026-06-20T17:00' },
        },
      ],
    })).toThrow('Solo se permiten hasta 3 instancias')
  })

  it('rejects invalid follow-up dates before checking sequence order', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        internal: { ...instancia.internal, fechaEnvio: 'no-es-fecha' },
      }],
    })).toThrow('La fecha y hora no es válida')
  })

  it('rejects an external email before its internal email', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        ...instancia,
        external: { ...instancia.external, fechaEnvio: '2026-06-20T09:00' },
      }],
    })).toThrow('El correo al cliente debe enviarse después del correo interno')
  })

  it('rejects overlapping instances', () => {
    expect(() => seguimientoSchema.parse({
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [
        instancia,
        {
          internal: { ...instancia.internal, fechaEnvio: '2026-06-20T10:30' },
          external: { ...instancia.external, fechaEnvio: '2026-06-20T12:00' },
        },
      ],
    })).toThrow('Cada instancia debe comenzar después del correo externo anterior')
  })
})
