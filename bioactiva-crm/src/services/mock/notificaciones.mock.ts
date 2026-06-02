import { EstadoNotif } from '@/types/enums'
import {
  Notificacion,
  NotificacionProgramada,
  CentroNotificaciones,
} from '@/types/notificacion.types'

type MockNotificacionProgramadaPayload = Partial<NotificacionProgramada> & {
  lead_codigo?: string
  lead_org?: string
  actividad_nombre?: string
  fecha_envio_externo?: string
  asunto_externo?: string
  cuerpo_externo?: string
  correo_cliente?: string
}

const MOCK_NOTIFICACIONES: Notificacion[] = [
  {
    id:           1,
    id_usuario:   1,
    id_actividad: 2,
    id_lead:      1,
    titulo:       'Actividad vencida en LEAD-2025-003',
    mensaje:      'La actividad "Reunión de presentación" está pendiente y ha vencido.',
    tipo:         'Alerta',
    estado:       EstadoNotif.NoLeida,
    created_at:   new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    lead_codigo:  'LEAD-2025-003',
    lead_org:     'Municipalidad de Miraflores',
  },
  {
    id:           2,
    id_usuario:   1,
    id_actividad: 4,
    id_lead:      4,
    titulo:       'Actividad vencida en LEAD-2025-008',
    mensaje:      'La actividad "Seguimiento post-propuesta" está pendiente y ha vencido.',
    tipo:         'Alerta',
    estado:       EstadoNotif.NoLeida,
    created_at:   new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lead_codigo:  'LEAD-2025-008',
    lead_org:     'Altomayo',
  },
  {
    id:           3,
    id_usuario:   1,
    id_lead:      3,
    titulo:       'Actividad vencida en LEAD-2025-005',
    mensaje:      'El lead lleva más de 30 días sin cambio de estado.',
    tipo:         'Alerta',
    estado:       EstadoNotif.Leida,
    created_at:   new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    lead_codigo:  'LEAD-2025-005',
    lead_org:     'Inversiones Pisco S.A.',
  },
]

const MOCK_PROGRAMADAS: NotificacionProgramada[] = []

const delay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetCentro = async (): Promise<CentroNotificaciones> => {
  await delay()

  const sinLeer = MOCK_NOTIFICACIONES.filter(
    (n) => n.estado === EstadoNotif.NoLeida
  ).length

  return {
    programadas: MOCK_PROGRAMADAS,
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
    throw { status: 404, message: 'Notificación no encontrada.' }
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
    throw { status: 404, message: 'Notificación programada no encontrada.' }
  }

  const notif = MOCK_PROGRAMADAS[index]
  if (notif.estado !== 'Programada') {
    throw { status: 400, message: 'La notificación no puede cancelarse porque ya fue ejecutada.' }
  }

  MOCK_PROGRAMADAS.splice(index, 1)
}

export const mockCreateRecordatorio = async (
  data: MockNotificacionProgramadaPayload
): Promise<NotificacionProgramada> => {
  await delay()

  const nueva: NotificacionProgramada = {
    id:               Date.now(),
    id_actividad:     data.id_actividad!,
    id_lead:          data.id_lead!,
    tipo:             'Recordatorio',
    fecha_envio:      data.fecha_envio!,
    asunto:           data.asunto!,
    cuerpo:           data.cuerpo!,
    destinatario:     data.destinatario ?? 'Responsable',
    estado:           'Programada',
    created_at:       new Date().toISOString(),
    lead_codigo:      data.lead_codigo,
    lead_org:         data.lead_org,
    actividad_nombre: data.actividad_nombre,
  }

  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}

export const mockCreateSeguimiento = async (
  data: MockNotificacionProgramadaPayload
): Promise<NotificacionProgramada> => {
  await delay()

  const nueva: NotificacionProgramada = {
    id:               Date.now(),
    id_actividad:     data.id_actividad!,
    id_lead:          data.id_lead!,
    tipo:             'Seguimiento',
    fecha_envio:      data.fecha_envio_externo ?? data.fecha_envio! ?? '',
    asunto:           data.asunto_externo ?? data.asunto! ?? '',
    cuerpo:           data.cuerpo_externo ?? data.cuerpo! ?? '',
    destinatario:     data.destinatario ?? data.correo_cliente ?? 'Cliente',
    estado:           'Programada',
    created_at:       new Date().toISOString(),
    lead_codigo:      data.lead_codigo,
    lead_org:         data.lead_org,
    actividad_nombre: data.actividad_nombre,
  }

  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}