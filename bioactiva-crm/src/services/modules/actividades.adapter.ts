import { Actividad, ActividadFormData } from '@/types/actividad.types'
import { TipoActividad, EstadoActividad } from '@/types/enums'

// ── Backend response shape ─────────────────────────────────────────────────

export interface BackendActividad {
  id:                  number
  nombreActividad:     string
  tipo:                string   // REUNION | LLAMADA | EMAIL | OTRO
  estado:              string   // PENDIENTE | REALIZADA | CANCELADA
  fechaInicio:         string
  fechaFin:            string
  notas:               string | null
  idLead:              number
  leadServicioInteres: string
  leadEstado:          string
  idResponsable:       number
  responsableName:     string
  outlookEventId:      string | null
  teamsMeetingUrl:     string | null
  createdAt:           string
  updatedAt:           string
}

// ── Enum mappers ───────────────────────────────────────────────────────────

const TIPO_BACKEND_A_FRONTEND: Record<string, TipoActividad> = {
  REUNION: TipoActividad.Reunion,
  LLAMADA: TipoActividad.Llamada,
  EMAIL:   TipoActividad.Email,
  OTRO:    TipoActividad.Otro,
}

const TIPO_FRONTEND_A_BACKEND: Record<TipoActividad, string> = {
  [TipoActividad.Reunion]: 'REUNION',
  [TipoActividad.Llamada]: 'LLAMADA',
  [TipoActividad.Email]:   'EMAIL',
  [TipoActividad.Otro]:    'OTRO',
}

const ESTADO_BACKEND_A_FRONTEND: Record<string, EstadoActividad> = {
  PENDIENTE:  EstadoActividad.Pendiente,
  REALIZADA:  EstadoActividad.Completada,
  CANCELADA:  EstadoActividad.Cancelada,
}

const ESTADO_FRONTEND_A_BACKEND: Record<EstadoActividad, string> = {
  [EstadoActividad.Pendiente]:  'PENDIENTE',
  [EstadoActividad.Completada]: 'REALIZADA',
  [EstadoActividad.Cancelada]:  'CANCELADA',
}

export function mapTipoToBackend(tipo: TipoActividad): string {
  return TIPO_FRONTEND_A_BACKEND[tipo]
}

export function mapEstadoActividadToBackend(estado: EstadoActividad): string {
  return ESTADO_FRONTEND_A_BACKEND[estado]
}

// ── Response mapper ────────────────────────────────────────────────────────

export function mapBackendActividad(raw: BackendActividad): Actividad {
  return {
    id:                     raw.id,
    id_lead:                raw.idLead,
    id_responsable:         raw.idResponsable,
    nombre_actividad:       raw.nombreActividad,
    fecha_inicio:           raw.fechaInicio,
    fecha_fin:              raw.fechaFin,
    tipo:                   TIPO_BACKEND_A_FRONTEND[raw.tipo]   ?? TipoActividad.Otro,
    estado:                 ESTADO_BACKEND_A_FRONTEND[raw.estado] ?? EstadoActividad.Pendiente,
    notas:                  raw.notas ?? undefined,
    outlook_event_id:       raw.outlookEventId ?? undefined,
    outlook_imported:       false,
    teamsMeetingUrl:        raw.teamsMeetingUrl ?? undefined,
    seguimiento_automatico: false,
    id_author:              0,
    created_at:             raw.createdAt,
    updated_at:             raw.updatedAt,
    responsable_nombre:     raw.responsableName,
    lead_servicio_interes:  raw.leadServicioInteres,
    lead_estado:            raw.leadEstado,
  }
}

// ── Request mapper ─────────────────────────────────────────────────────────

export function mapActividadFormToBackend(
  data: ActividadFormData
): Record<string, unknown> {
  return {
    idLead:           data.id_lead,
    nombreActividad:  data.nombre_actividad,
    fechaInicio:      data.fecha_inicio,
    fechaFin:         data.fecha_fin,
    tipo:             mapTipoToBackend(data.tipo),
    idResponsable:    data.id_responsable,
    notas:            data.notas,
    syncWithMicrosoft:  false,
    createTeamsMeeting: false,
  }
}

export function mapActividadUpdateToBackend(
  data: Partial<ActividadFormData>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (data.nombre_actividad !== undefined) out.nombreActividad = data.nombre_actividad
  if (data.fecha_inicio     !== undefined) out.fechaInicio     = data.fecha_inicio
  if (data.fecha_fin        !== undefined) out.fechaFin        = data.fecha_fin
  if (data.notas            !== undefined) out.notas           = data.notas
  if (data.id_responsable   !== undefined) out.idResponsable   = data.id_responsable
  return out
}
