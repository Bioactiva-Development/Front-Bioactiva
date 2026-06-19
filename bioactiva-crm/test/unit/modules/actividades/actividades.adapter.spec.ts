import {
  mapBackendActividad,
  mapTipoToBackend,
  mapEstadoActividadToBackend,
  mapActividadFormToBackend,
  mapActividadUpdateToBackend,
  BackendActividad,
} from '@/services/modules/actividades.adapter'
import { ActividadFormData } from '@/types/actividad.types'
import { TipoActividad, EstadoActividad } from '@/types/enums'

describe('actividades.adapter', () => {
  const mockBackend: BackendActividad = {
    id: 12,
    nombreActividad: 'Discovery call',
    tipo: 'LLAMADA',
    estado: 'PENDIENTE',
    fechaInicio: '2026-06-10T14:00:00.000Z',
    fechaFin: '2026-06-10T15:00:00.000Z',
    notas: 'Discuss requirements',
    idLead: 10,
    leadServicioInteres: 'Ley 30309',
    leadEstado: 'EN_PROSPECTO',
    idResponsable: 3,
    responsableName: 'Admin User',
    outlookEventId: null,
    teamsMeetingUrl: null,
    createdAt: '2026-06-10T13:00:00.000Z',
    updatedAt: '2026-06-10T13:30:00.000Z',
  }

  describe('mapBackendActividad', () => {
    it('converts BackendActividad to Actividad correctly', () => {
      const result = mapBackendActividad(mockBackend)

      expect(result).toMatchObject({
        id: 12,
        id_lead: 10,
        id_responsable: 3,
        nombre_actividad: 'Discovery call',
        tipo: TipoActividad.Llamada,
        estado: EstadoActividad.Pendiente,
        fecha_inicio: '2026-06-10T14:00:00.000Z',
        fecha_fin: '2026-06-10T15:00:00.000Z',
        notas: 'Discuss requirements',
        responsable_nombre: 'Admin User',
        lead_servicio_interes: 'Ley 30309',
        lead_estado: 'EN_PROSPECTO',
        outlook_imported: false,
        seguimiento_automatico: false,
        id_author: 0,
        created_at: '2026-06-10T13:00:00.000Z',
        updated_at: '2026-06-10T13:30:00.000Z',
      })
    })

    it('falls back to TipoActividad.Otro for unknown tipo', () => {
      const result = mapBackendActividad({ ...mockBackend, tipo: 'FAKE_TIPO' })
      expect(result.tipo).toBe(TipoActividad.Otro)
    })

    it('falls back to EstadoActividad.Pendiente for unknown estado', () => {
      const result = mapBackendActividad({ ...mockBackend, estado: 'FAKE_ESTADO' })
      expect(result.estado).toBe(EstadoActividad.Pendiente)
    })
  })

  describe('mapTipoToBackend', () => {
    it('maps each TipoActividad correctly', () => {
      expect(mapTipoToBackend(TipoActividad.Reunion)).toBe('REUNION')
      expect(mapTipoToBackend(TipoActividad.Llamada)).toBe('LLAMADA')
      expect(mapTipoToBackend(TipoActividad.Email)).toBe('EMAIL')
      expect(mapTipoToBackend(TipoActividad.Otro)).toBe('OTRO')
    })
  })

  describe('mapEstadoActividadToBackend', () => {
    it('maps each EstadoActividad correctly', () => {
      expect(mapEstadoActividadToBackend(EstadoActividad.Pendiente)).toBe('PENDIENTE')
      expect(mapEstadoActividadToBackend(EstadoActividad.Completada)).toBe('REALIZADA')
      expect(mapEstadoActividadToBackend(EstadoActividad.Cancelada)).toBe('CANCELADA')
    })
  })

  describe('mapActividadFormToBackend', () => {
    it('returns correct backend shape', () => {
      const formData: ActividadFormData = {
        id_lead: 10,
        nombre_actividad: 'Discovery call',
        fecha_inicio: '2026-06-10T14:00:00.000Z',
        fecha_fin: '2026-06-10T15:00:00.000Z',
        tipo: TipoActividad.Llamada,
        notas: 'Discuss requirements',
      }

      const result = mapActividadFormToBackend(formData)

      expect(result).toEqual({
        idLead: 10,
        nombreActividad: 'Discovery call',
        fechaInicio: '2026-06-10T14:00:00.000Z',
        fechaFin: '2026-06-10T15:00:00.000Z',
        tipo: 'LLAMADA',
        notas: 'Discuss requirements',
        syncWithMicrosoft: false,
        createTeamsMeeting: false,
      })
    })
  })

  describe('mapActividadUpdateToBackend', () => {
    it('only includes defined fields', () => {
      const result = mapActividadUpdateToBackend({
        nombre_actividad: 'Updated name',
        fecha_inicio: '2026-07-01T10:00:00.000Z',
      })

      expect(result).toEqual({
        nombreActividad: 'Updated name',
        fechaInicio: '2026-07-01T10:00:00.000Z',
      })
    })

    it('omits undefined fields', () => {
      const result = mapActividadUpdateToBackend({
        nombre_actividad: 'Updated name',
        fecha_inicio: undefined,
        fecha_fin: undefined,
        notas: undefined,
      })

      expect(result).toEqual({
        nombreActividad: 'Updated name',
      })
    })
  })
})
