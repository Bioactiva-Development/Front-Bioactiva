jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { notificacionesService } from '@/services/modules/notificaciones.service'

const scheduled = {
  id: 1,
  tipo: 'RECORDATORIO',
  estado: 'PROGRAMADA',
  idActividad: 5,
  idLead: 10,
  idResponsable: 3,
  asuntoInterno: 'Recordatorio',
  fechaEnvioInterno: '2026-06-20T10:00:00.000Z',
  enviadoInterno: false,
  correoCliente: null,
  instancias: null,
  createdAt: '2026-06-15T10:00:00.000Z',
}

describe('notificaciones/notificaciones.service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists scheduled notifications with idLead filter', async () => {
    const page = { data: [scheduled], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } }
    getMock.mockResolvedValueOnce({ data: page })

    const result = await notificacionesService.getProgramadas({ idLead: 10 })
    expect(getMock).toHaveBeenCalledWith('/notifications', {
      params: { idLead: 10 },
    })
    expect(result.data).toHaveLength(1)
  })

  it('lists scheduled notifications with no filters', async () => {
    const page = { data: [scheduled], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } }
    getMock.mockResolvedValueOnce({ data: page })

    const result = await notificacionesService.getProgramadas()
    expect(getMock).toHaveBeenCalledWith('/notifications', {
      params: {},
    })
    expect(result.data).toHaveLength(1)
  })

  it('lists scheduled notifications with backend filters', async () => {
    const page = {
      data: [scheduled],
      meta: { page: 2, limit: 5, total: 6, totalPages: 2 },
    }
    getMock.mockResolvedValueOnce({ data: page })
    const result = await notificacionesService.getProgramadas({
      estado: 'PROGRAMADA',
      idResponsable: 3,
      page: 2,
      limit: 5,
    })

    expect(getMock).toHaveBeenCalledWith('/notifications', {
      params: { estado: 'PROGRAMADA', idResponsable: 3, page: 2, limit: 5 },
    })
    expect(result).toEqual(page)
  })

  it('gets in-app notifications', async () => {
    getMock.mockResolvedValueOnce({ data: [{ id: 4, estado: 'NO_LEIDA' }] })
    const result = await notificacionesService.getInApp()
    expect(getMock).toHaveBeenCalledWith('/notifications/in-app')
    expect(result).toHaveLength(1)
  })

  it('marks one in-app notification as read', async () => {
    patchMock.mockResolvedValueOnce({ data: { id: 4, estado: 'LEIDA' } })
    const result = await notificacionesService.marcarLeida(4)
    expect(patchMock).toHaveBeenCalledWith('/notifications/in-app/4/read')
    expect(result.estado).toBe('LEIDA')
  })

  it('cancels a scheduled notification', async () => {
    deleteMock.mockResolvedValueOnce({
      data: { ...scheduled, estado: 'CANCELADA' },
    })
    const result = await notificacionesService.cancelarProgramada(1)
    expect(deleteMock).toHaveBeenCalledWith('/notifications/1')
    expect(result.estado).toBe('CANCELADA')
  })

  it('creates a reminder using idLead and minutosAntes', async () => {
    const payload = {
      idLead: 10,
      minutosAntes: 30,
      idTemplate: null,
      asunto: 'Recordatorio',
      cuerpo: 'Cuerpo',
    }
    postMock.mockResolvedValueOnce({ data: scheduled })
    await notificacionesService.createRecordatorio(payload)
    expect(postMock).toHaveBeenCalledWith('/notifications/reminders', payload)
  })

  it('creates a follow-up with nested instances', async () => {
    const payload = {
      idLead: 10,
      correoCliente: 'cliente@example.com',
      instancias: [{
        internal: {
          fechaEnvio: '2026-06-20T10:00:00.000Z',
          idTemplate: null,
          asunto: 'Interno',
          cuerpo: 'Preparar',
        },
        external: {
          fechaEnvio: '2026-06-20T11:00:00.000Z',
          idTemplate: null,
          asunto: 'Cliente',
          cuerpo: 'Seguimiento',
        },
      }],
    }
    postMock.mockResolvedValueOnce({ data: { ...scheduled, tipo: 'SEGUIMIENTO' } })
    await notificacionesService.createSeguimiento(payload)
    expect(postMock).toHaveBeenCalledWith('/notifications/follow-ups', payload)
  })

  it('edits a scheduled follow-up with the flat PATCH contract', async () => {
    const payload = {
      correoCliente: 'cliente@example.com',
      internal: {
        fechaEnvio: '2026-06-20T10:00:00.000Z',
        idTemplate: null,
        asunto: 'Interno actualizado',
        cuerpo: 'Preparar',
      },
      external: {
        fechaEnvio: '2026-06-20T11:00:00.000Z',
        idTemplate: null,
        asunto: 'Cliente actualizado',
        cuerpo: 'Seguimiento',
      },
    }
    patchMock.mockResolvedValueOnce({ data: { ...scheduled, tipo: 'SEGUIMIENTO' } })

    await notificacionesService.editarSeguimiento(20, payload)

    expect(patchMock).toHaveBeenCalledWith(
      '/notifications/follow-ups/20',
      payload
    )
  })
})
