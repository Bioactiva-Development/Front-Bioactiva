import {
  mockCreateRecordatorio,
  mockCreateSeguimiento,
  mockGetInApp,
  mockGetProgramadas,
  mockMarcarLeida,
} from '@/services/mock/notificaciones.mock'

describe('notification mocks', () => {
  it('returns and marks in-app notifications', async () => {
    const inbox = await mockGetInApp()
    expect(inbox.length).toBeGreaterThan(0)
    const updated = await mockMarcarLeida(inbox[0].id)
    expect(updated.estado).toBe('LEIDA')
  })

  it('creates and filters scheduled reminders', async () => {
    await mockCreateRecordatorio({
      idLead: 1,
      minutosAntes: 30,
      asunto: 'Aviso',
      cuerpo: 'Cuerpo',
    })
    const result = await mockGetProgramadas({
      estado: 'PROGRAMADA',
      idLead: 1,
    })
    expect(result.some((item) => item.tipo === 'RECORDATORIO')).toBe(true)
  })

  it('creates follow-ups with nested instances', async () => {
    const result = await mockCreateSeguimiento({
      idLead: 1,
      correoCliente: 'cliente@example.com',
      instancias: [{
        internal: {
          fechaEnvio: '2026-06-20T10:00:00.000Z',
          asunto: 'Interno',
          cuerpo: 'Preparar',
        },
        external: {
          fechaEnvio: '2026-06-20T11:00:00.000Z',
          asunto: 'Cliente',
          cuerpo: 'Seguimiento',
        },
      }],
    })
    expect(result.instancias).toHaveLength(1)
  })
})
