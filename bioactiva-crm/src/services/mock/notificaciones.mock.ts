import {
  CrearRecordatorioRequest,
  CrearSeguimientoRequest,
  FiltrosNotificacionesProgramadas,
  NotificacionInApp,
  NotificacionProgramada,
} from '@/types/notificacion.types'

const MOCK_IN_APP: NotificacionInApp[] = [
  {
    id: 1,
    titulo: 'Lead sin movimiento',
    mensaje: 'El lead lleva más de 30 días sin cambio de estado.',
    estado: 'NO_LEIDA',
    idLead: 1,
    idActividad: null,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
]

const MOCK_PROGRAMADAS: NotificacionProgramada[] = []

const delay = (ms = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetInApp = async (): Promise<NotificacionInApp[]> => {
  await delay()
  return [...MOCK_IN_APP]
}

export const mockGetProgramadas = async (
  filtros?: FiltrosNotificacionesProgramadas
): Promise<NotificacionProgramada[]> => {
  await delay()
  return MOCK_PROGRAMADAS.filter((notificacion) => {
    if (filtros?.estado && notificacion.estado !== filtros.estado) return false
    if (filtros?.idLead && notificacion.idLead !== filtros.idLead) return false
    if (
      filtros?.idResponsable &&
      notificacion.idResponsable !== filtros.idResponsable
    ) return false
    return true
  })
}

export const mockMarcarLeida = async (
  id: number
): Promise<NotificacionInApp> => {
  await delay()
  const index = MOCK_IN_APP.findIndex((notificacion) => notificacion.id === id)
  if (index === -1) throw new Error('Notificación no encontrada.')
  MOCK_IN_APP[index] = { ...MOCK_IN_APP[index], estado: 'LEIDA' }
  return MOCK_IN_APP[index]
}

export const mockCancelarProgramada = async (
  id: number
): Promise<NotificacionProgramada> => {
  await delay()
  const index = MOCK_PROGRAMADAS.findIndex(
    (notificacion) => notificacion.id === id
  )
  if (index === -1) throw new Error('Notificación programada no encontrada.')
  if (MOCK_PROGRAMADAS[index].estado !== 'PROGRAMADA') {
    throw new Error('La notificación ya no puede cancelarse.')
  }
  MOCK_PROGRAMADAS[index] = {
    ...MOCK_PROGRAMADAS[index],
    estado: 'CANCELADA',
  }
  return MOCK_PROGRAMADAS[index]
}

export const mockCreateRecordatorio = async (
  data: CrearRecordatorioRequest
): Promise<NotificacionProgramada> => {
  await delay()
  const fechaEnvio = new Date(
    Date.now() + Math.max(1, 120 - data.minutosAntes) * 60_000
  ).toISOString()
  const nueva: NotificacionProgramada = {
    id: Date.now(),
    tipo: 'RECORDATORIO',
    estado: 'PROGRAMADA',
    idActividad: data.idLead,
    idLead: data.idLead,
    idResponsable: 1,
    asuntoInterno: data.asunto,
    fechaEnvioInterno: fechaEnvio,
    enviadoInterno: false,
    correoCliente: null,
    instancias: null,
    createdAt: new Date().toISOString(),
  }
  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}

export const mockCreateSeguimiento = async (
  data: CrearSeguimientoRequest
): Promise<NotificacionProgramada> => {
  await delay()
  const nueva: NotificacionProgramada = {
    id: Date.now(),
    tipo: 'SEGUIMIENTO',
    estado: 'PROGRAMADA',
    idActividad: data.idLead,
    idLead: data.idLead,
    idResponsable: 1,
    asuntoInterno: null,
    fechaEnvioInterno: null,
    enviadoInterno: false,
    correoCliente: data.correoCliente,
    instancias: data.instancias.map((instancia, index) => ({
      id: Date.now() + index + 1,
      orden: index + 1,
      asuntoInterno: instancia.internal.asunto,
      fechaEnvioInterno: instancia.internal.fechaEnvio,
      enviadoInterno: false,
      asuntoExterno: instancia.external.asunto,
      fechaEnvioExterno: instancia.external.fechaEnvio,
      enviadoExterno: false,
    })),
    createdAt: new Date().toISOString(),
  }
  MOCK_PROGRAMADAS.push(nueva)
  return nueva
}
