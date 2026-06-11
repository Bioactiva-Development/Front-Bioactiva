import {
  fromLeadDto,
  toBackendLeadState,
  toCreateLeadDto,
  toLeadQueryParams,
  toUpdateLeadDto,
} from '@/services/modules/leads.mapper'
import { LeadState } from '@/types/enums'

describe('leads.mapper', () => {
  it('maps backend lead DTOs to frontend leads', () => {
    const lead = fromLeadDto({
      id: 7,
      estado: 'OFERTADO',
      servicioInteres: 'Ley 30309',
      comentarios: null,
      desafioOportunidad: 'Optimizar I+D+i',
      notasContacto: null,
      canalCaptacion: 'Referido',
      idOrg: '123e4567-e89b-12d3-a456-426614174000',
      organizationName: 'Altomayo',
      idContacto: 4,
      contactName: 'Patricia Ccopa Mamani',
      idEncargado: 3,
      encargadoName: 'Administración',
      idAuthor: 1,
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T11:00:00.000Z',
      ultimoCambioEstado: '2026-06-02T12:00:00.000Z',
      fechaCierre: '2026-06-30T00:00:00.000Z',
    })

    expect(lead).toMatchObject({
      id: 7,
      codigo: 'LEAD-2026-007',
      id_org: '123e4567-e89b-12d3-a456-426614174000',
      id_contacto: 4,
      estado: LeadState.Ofertado,
      servicio_interes: 'Ley 30309',
      desafio_oportunidad: 'Optimizar I+D+i',
      canal_captacion: 'Referido',
      organizacion_nombre: 'Altomayo',
      contacto_nombre: 'Patricia Ccopa Mamani',
      encargado_nombre: 'Administración',
      fecha_cierre: '2026-06-30T00:00:00.000Z',
      updated_at: '2026-06-02T12:00:00.000Z',
    })
  })

  it('maps the activity alert (semáforo) and ignores unknown values', () => {
    const base = {
      id: 1,
      estado: 'EN_PROSPECTO',
      servicioInteres: 'X',
      comentarios: null,
      desafioOportunidad: null,
      notasContacto: null,
      canalCaptacion: null,
      idOrg: 'org-1',
      organizationName: 'Org',
      idContacto: null,
      contactName: null,
      idEncargado: 1,
      encargadoName: 'Enc',
      idAuthor: 1,
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
      ultimoCambioEstado: '2026-06-02T10:00:00.000Z',
    }

    expect(fromLeadDto({ ...base, activityAlert: 'ROJO' }).activity_alert).toBe('ROJO')
    expect(fromLeadDto({ ...base, activityAlert: 'AMARILLO' }).activity_alert).toBe('AMARILLO')
    expect(fromLeadDto({ ...base, activityAlert: 'VERDE' }).activity_alert).toBe('VERDE')
    expect(fromLeadDto({ ...base, activityAlert: 'desconocido' }).activity_alert).toBeUndefined()
    expect(fromLeadDto(base).activity_alert).toBeUndefined()
  })

  it('maps the new lead list filters (organización, semáforo y rango de fechas)', () => {
    expect(toLeadQueryParams({
      id_org: 'org-uuid-1',
      alerta_actividad: 'VENCIDAS',
      fecha_desde: '2022-01-01',
      fecha_hasta: '2026-06-11',
      page: 1,
      limit: 10,
    })).toEqual({
      idOrg: 'org-uuid-1',
      alertaActividad: 'VENCIDAS',
      fechaDesde: '2022-01-01',
      fechaHasta: '2026-06-11',
      page: 1,
      limit: 10,
    })

    // Sin alerta_actividad no se envía el parámetro (trae todos los leads).
    expect(toLeadQueryParams({})).toEqual({})
  })

  it('maps frontend states and payloads to backend DTOs', () => {
    expect(toBackendLeadState(LeadState.CierreVenta)).toBe('CIERRE_CON_VENTA')

    expect(toLeadQueryParams({
      estado: LeadState.Prospecto,
      id_encargado: 2,
      search: 'innovación',
      page: 1,
      limit: 20,
    })).toEqual({
      estado: 'EN_PROSPECTO',
      idEncargado: 2,
      search: 'innovación',
      page: 1,
      limit: 20,
    })

    expect(toCreateLeadDto({
      id_org: '123e4567-e89b-12d3-a456-426614174000',
      id_contacto: 4,
      estado: LeadState.Ofertado,
      servicio_interes: 'Ley 30309',
      comentarios: '',
      desafio_oportunidad: 'Oportunidad',
      notas_contacto: '',
      id_encargado: 3,
      canal_captacion: 'Referido',
      fecha_cierre: '2026-06-30',
    })).toEqual({
      idOrg: '123e4567-e89b-12d3-a456-426614174000',
      idContacto: 4,
      servicioInteres: 'Ley 30309',
      desafioOportunidad: 'Oportunidad',
      canalCaptacion: 'Referido',
      idEncargado: 3,
    })

    expect(toUpdateLeadDto({
      servicio_interes: 'Nuevo servicio',
      fecha_cierre: '2026-07-15',
      estado: LeadState.CierreSinVenta,
    })).toEqual({
      servicioInteres: 'Nuevo servicio',
    })
  })
})
