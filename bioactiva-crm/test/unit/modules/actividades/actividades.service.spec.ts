jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const postMock = jest.fn()
const patchMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, post: postMock, patch: patchMock, delete: deleteMock },
}))

import { actividadesService } from '@/services/modules/actividades.service'
import { EstadoActividad, TipoActividad } from '@/types/enums'

const rawActividad = {
  id: 12,
  nombreActividad: 'Discovery call',
  tipo: 'LLAMADA',
  estado: 'PENDIENTE',
  fechaInicio: '2026-06-10T14:00:00.000Z',
  fechaFin: '2026-06-10T15:00:00.000Z',
  notas: 'Discuss requirements',
  idLead: 10,
  idResponsable: 3,
  responsableName: 'Administración',
  outlookEventId: null,
  teamsMeetingUrl: null,
  createdAt: '2026-06-10T13:00:00.000Z',
  updatedAt: '2026-06-10T13:30:00.000Z',
}

describe('actividades/actividades.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getByLead', () => {
    it('fetches activities by lead id', async () => {
      getMock.mockResolvedValueOnce({ data: [rawActividad] })

      const result = await actividadesService.getByLead(10)
      expect(getMock).toHaveBeenCalledWith('/activities', {
        params: { idLead: 10, page: 1, limit: 100 },
      })
      expect(result).toHaveLength(1)
      expect(result[0].nombre_actividad).toBe('Discovery call')
    })

    it('handles paginated response', async () => {
      getMock.mockResolvedValueOnce({
        data: { data: [rawActividad], meta: { page: 1, limit: 10, total: 1, totalPages: 1 } },
      })

      const result = await actividadesService.getByLead(10)
      expect(result).toHaveLength(1)
    })

    it('returns empty array when no activities', async () => {
      getMock.mockResolvedValueOnce({ data: [] })

      const result = await actividadesService.getByLead(10)
      expect(result).toEqual([])
    })
  })

  describe('getAll', () => {
    it('fetches pending meetings for the Microsoft calendar view', async () => {
      getMock.mockResolvedValueOnce({
        data: [{ ...rawActividad, tipo: 'REUNION' }],
      })

      const result = await actividadesService.getAll({
        estado: EstadoActividad.Pendiente,
        tipo: TipoActividad.Reunion,
        id_responsable: 3,
      })

      expect(getMock).toHaveBeenCalledWith('/activities', {
        params: {
          estado: 'PENDIENTE',
          tipo: 'REUNION',
          idResponsable: 3,
          page: 1,
          limit: 100,
        },
      })
      expect(result).toHaveLength(1)
      expect(result[0].tipo).toBe(TipoActividad.Reunion)
    })
  })

  describe('create', () => {
    it('posts create activity and returns mapped actividad', async () => {
      postMock.mockResolvedValueOnce({ data: rawActividad })

      const result = await actividadesService.create({
        id_lead: 10, nombre_actividad: 'Discovery call',
        tipo: TipoActividad.Llamada, estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00', fecha_fin: '2026-06-10T15:00',
      })

      expect(postMock).toHaveBeenCalledWith('/activities', expect.objectContaining({
        idLead: 10, nombreActividad: 'Discovery call',
      }))
      expect(result.id).toBe(12)
    })
  })

  describe('update', () => {
    it('patches activity and returns updated data', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, nombreActividad: 'Updated call' } })

      const result = await actividadesService.update(12, { nombre_actividad: 'Updated call' })
      expect(patchMock).toHaveBeenCalledWith('/activities/12', { nombreActividad: 'Updated call' })
      expect(result.nombre_actividad).toBe('Updated call')
    })
  })

  describe('createCalendarEvent', () => {
    it('creates an Outlook/Teams event on demand', async () => {
      postMock.mockResolvedValueOnce({
        data: {
          ...rawActividad,
          tipo: 'REUNION',
          outlookEventId: 'AAMkAGI2',
          teamsMeetingUrl: 'https://teams.microsoft.com/l/meetup-join/abc',
        },
      })

      const result = await actividadesService.createCalendarEvent(12)
      expect(postMock).toHaveBeenCalledWith('/activities/12/calendar-event')
      expect(result.outlook_event_id).toBe('AAMkAGI2')
      expect(result.teamsMeetingUrl).toContain('teams.microsoft.com')
    })
  })

  describe('complete', () => {
    it('completes activity without chaining unsupported notification calls', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, estado: 'REALIZADA' } })

      const result = await actividadesService.complete(12)
      expect(patchMock).toHaveBeenCalledWith('/activities/12/complete')
      expect(result.estado).toBe(EstadoActividad.Completada)
    })

    it('updates notas before completing when provided', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, notas: 'Updated notes' } })
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, notas: 'Updated notes', estado: 'REALIZADA' } })

      await actividadesService.complete(12, 'Updated notes')
      expect(patchMock).toHaveBeenCalledWith('/activities/12', { notas: 'Updated notes' })
    })
  })

  describe('updateNotas', () => {
    it('patches the dedicated notes endpoint and returns mapped actividad', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, notas: 'Comentario editado' } })

      const result = await actividadesService.updateNotas(12, 'Comentario editado')
      expect(patchMock).toHaveBeenCalledWith('/activities/12/notes', { notas: 'Comentario editado' })
      expect(result.notas).toBe('Comentario editado')
    })
  })

  describe('cancel', () => {
    it('cancels activity through its dedicated endpoint', async () => {
      patchMock.mockResolvedValueOnce({ data: { ...rawActividad, estado: 'CANCELADA' } })

      const result = await actividadesService.cancel(12)
      expect(patchMock).toHaveBeenCalledWith('/activities/12/cancel')
      expect(result.estado).toBe(EstadoActividad.Pendiente)
    })
  })

  describe('delete', () => {
    it('deletes activity', async () => {
      deleteMock.mockResolvedValueOnce({})
      await actividadesService.delete(12)
      expect(deleteMock).toHaveBeenCalledWith('/activities/12')
    })
  })
})
