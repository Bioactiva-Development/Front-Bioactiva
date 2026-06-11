import { EstadoNotif } from '@/types/enums'
import {
  CentroNotificaciones,
  CrearRecordatorioInput,
  CrearSeguimientoInput,
  Notificacion,
  NotificacionProgramada,
  NotificacionProgramadaFiltros,
} from '@/types/notificacion.types'
import { toFechaEnvioIso } from '@/services/modules/notificaciones.mapper'

const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id:           1,
    id_actividad: 2,
    id_lead:      1,
    titulo:       'Actividad vencida en LEAD-2025-003',
    mensaje:      'La actividad "Reunión de presentación" está pendiente y ha vencido.',
    estado:       EstadoNotif.NoLeida,
    created_at:   new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    lead_codigo:  'LEAD-2025-003',
    lead_org:     'Municipalidad de Miraflores',
  },
  {
    id:           2,
    id_actividad: 4,
    id_lead:      4,
    titulo:       'Actividad vencida en LEAD-2025-008',
    mensaje:      'La actividad "Seguimiento post-propuesta" está pendiente y ha vencido.',
    estado:       EstadoNotif.NoLeida,
    created_at:   new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lead_codigo:  'LEAD-2025-008',
    lead_org:     'Altomayo',
  },
  {
    id:          3,
    id_lead:     3,
    titulo:      'Lead sin movimiento',
    mensaje:     'El lead lleva más de 30 días sin cambio de estado.',
    estado:      EstadoNotif.Leida,
    created_at:  new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lead_codigo: 'LEAD-2025-005',
    lead_org:    'Inversiones Pisco S.A.',
  },
]

const MOCK_PROGRAMADAS: NotificacionProgramada[] = []

const delay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/** Replica la regla del backend: una sola PROGRAMADA por actividad (409). */
const assertSinProgramadaActiva = (actividadId: number) => {
  const existe = MOCK_PROGRAMADAS.some(
    (p) => p.id_actividad === actividadId && p.estado === 'PROGRAMADA'
  )
  if (existe) {
    throw Object.assign(
      new Error('Si desea registrar una nueva notificación, debe eliminar la que está asociada actualmente.'),
      { status: 409 }
    )
  }
}

export const mockGetProgramadas = async (
  filtros?: NotificacionProgramadaFiltros
): Promise<NotificacionProgramada[]> => {
  await delay()
  return MOCK_PROGRAMADAS.filter((p) => {
    if (filtros?.estado && p.estado !== filtros.estado) return false
    if (filtros?.id_lead != null && p.id_lead !== filtros.id_lead) return false
    if (filtros?.id_responsable != null && p.id_responsable !== filtros.id_responsable) return false
    return true
  })
}

export const mockGetCentro = async (): Promise<CentroNotificaciones> => {
  await delay()

  const sinLeer = MOCK_NOTIFICACIONES.filter(
    (n) => n.estado === EstadoNotif.NoLeida
  ).length

  return {
    programadas: MOCK_PROGRAMADAS.filter((p) => p.estado === 'PROGRAMADA'),
    vencidas:    MOCK_NOTIFICACIONES,
    sinLeer,
  }
}

export const mockGetNotificaciones = async (): Promise<Notificacion[]> => {
  await delay()
  return MOCK_NOTIFICACIONES
}

export const mockMarcarLeida = async (id: number): Promise<Notificacion> => {
  await delay(200)

  const index = MOCK_NOTIFICACIONES.findIndex((n) => n.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Notificación no encontrada.'), { status: 404 })
  }

  MOCK_NOTIFICACIONES[index] = {
    ...MOCK_NOTIFICACIONES[index],
    estado: EstadoNotif.Leida,
  }

  return MOCK_NOTIFICACIONES[index]
}

export const mockMarcarTodasLeidas = async (): Promise<void> => {
  await delay(300)
  MOCK_NOTIFICACIONES.forEach((n) => {
    n.estado = EstadoNotif.Leida
  })
}

export const mockCancelarProgramada = async (id: number): Promise<void> => {
  await delay()

  const index = MOCK_PROGRAMADAS.findIndex((n) => n.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Notificación programada no encontrada.'), { status: 404 })
  }

  const notif = MOCK_PROGRAMADAS[index]
  if (notif.estado !== 'PROGRAMADA') {
    throw Object.assign(
      new Error('La notificación no puede cancelarse porque ya fue ejecutada.'),
      { status: 409 }
    )
  }

  MOCK_PROGRAMADAS.splice(index, 1)
}

export const mockCancelarPendientesPorActividad = async (
  actividadId: number
): Promise<void> => {
  await delay()

  for (let index = MOCK_PROGRAMADAS.length - 1; index >= 0; index -= 1) {
    const programada = MOCK_PROGRAMADAS[index]
    if (
      programada.id_actividad === actividadId &&
      programada.estado === 'PROGRAMADA'
    ) {
      MOCK_PROGRAMADAS.splice(index, 1)
    }
  }
}

export const mockCreateRecordatorio = async (
  data: CrearRecordatorioInput
): Promise<NotificacionProgramada> => {
  await delay()
  assertSinProgramadaActiva(data.id_actividad)

  const nueva: NotificacionProgramada = {
    id:                  Date.now(),
    tipo:                'RECORDATORIO',
    estado:              'PROGRAMADA',
    id_actividad:        data.id_actividad,
    id_lead:             data.id_lead ?? 0,
    id_responsable:      0,
    asunto_interno:      data.asunto,
    fecha_envio_interno: toFechaEnvioIso(data.fecha_envio, data.hora_envio),
    enviado_interno:     false,
    correo_cliente:      null,
    asunto_externo:      null,
    fecha_envio_externo: null,
    enviado_externo:     false,
    created_at:          new Date().toISOString(),
    lead_codigo:         data.lead_codigo,
    lead_org:            data.lead_org,
    actividad_nombre:    data.actividad_nombre,
    destinatario:        data.destinatario,
  }

  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}

export const mockCreateSeguimiento = async (
  data: CrearSeguimientoInput
): Promise<NotificacionProgramada> => {
  await delay()
  assertSinProgramadaActiva(data.id_actividad)

  const nueva: NotificacionProgramada = {
    id:                  Date.now(),
    tipo:                'SEGUIMIENTO',
    estado:              'PROGRAMADA',
    id_actividad:        data.id_actividad,
    id_lead:             data.id_lead ?? 0,
    id_responsable:      0,
    asunto_interno:      data.asunto_interno,
    fecha_envio_interno: toFechaEnvioIso(data.fecha_envio_interno, data.hora_envio_interno),
    enviado_interno:     false,
    correo_cliente:      data.correo_cliente,
    asunto_externo:      data.asunto_externo,
    fecha_envio_externo: toFechaEnvioIso(data.fecha_envio_externo, data.hora_envio_externo),
    enviado_externo:     false,
    created_at:          new Date().toISOString(),
    lead_codigo:         data.lead_codigo,
    lead_org:            data.lead_org,
    actividad_nombre:    data.actividad_nombre,
    destinatario:        data.destinatario ?? data.correo_cliente,
  }

  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}
