import {
  fromActividadDto,
  toActividadQueryParams,
  toCreateActividadDto,
  toUpdateActividadDto,
} from '@/services/modules/actividades.mapper'
import { EstadoActividad, TipoActividad } from '@/types/enums'

describe('actividades.mapper', () => {
  it('maps backend activity DTOs to frontend activities', () => {
    const actividad = fromActividadDto({
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
    })

    expect(actividad).toMatchObject({
      id: 12,
      id_lead: 10,
      id_responsable: 3,
      nombre_actividad: 'Discovery call',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
      fecha_inicio: '2026-06-10T14:00:00.000Z',
      fecha_fin: '2026-06-10T15:00:00.000Z',
      responsable_nombre: 'Administración',
    })
  })

  it('maps frontend filters and payloads to backend activities', () => {
    expect(toActividadQueryParams({
      id_lead: 10,
      id_responsable: 3,
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Pendiente,
    })).toEqual({
      idLead: 10,
      idResponsable: 3,
      tipo: 'LLAMADA',
      estado: 'PENDIENTE',
    })

    expect(toCreateActividadDto({
      id_lead: 10,
      nombre_actividad: 'Discovery call',
      fecha_inicio: '2026-06-10T14:00',
      fecha_fin: '2026-06-10T15:00',
      tipo: TipoActividad.Llamada,
      estado: EstadoActividad.Completada,
      notas: 'Discuss requirements',
    })).toEqual({
      idLead: 10,
      nombreActividad: 'Discovery call',
      fechaInicio: new Date('2026-06-10T14:00').toISOString(),
      fechaFin: new Date('2026-06-10T15:00').toISOString(),
      tipo: 'LLAMADA',
      notas: 'Discuss requirements',
    })

    expect(toUpdateActividadDto({
      nombre_actividad: 'Follow-up call',
      fecha_fin: '2026-06-10T16:00',
      estado: EstadoActividad.Completada,
    })).toEqual({
      nombreActividad: 'Follow-up call',
      fechaFin: new Date('2026-06-10T16:00').toISOString(),
    })
  })
})
