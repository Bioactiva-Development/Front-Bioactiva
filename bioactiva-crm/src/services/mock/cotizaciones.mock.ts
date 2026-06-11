import { EstadoCot, TipoMoneda } from '@/types/enums'
import {
  Cotizacion,
  CotizacionFiltros,
  CotizacionesResponse,
  CotizacionFormData,
  CotizacionKpis,
} from '@/types/cotizacion.types'

const MOCK_COTIZACIONES: Cotizacion[] = [
  {
    id:               1,
    codigo:           'COT-2025-003',
    id_lead:          1,
    id_remitente:     1,
    fecha_cot:        '2025-03-15T08:00:00Z',
    dirigido:         'Roxana Salcedo Mora',
    cliente:          'Municipalidad de Miraflores',
    producto:         'Consultoría I+D',
    nombre_remitente: 'Administración',
    nombre_servicio:  'Formulación de proyecto para beneficios tributarios Ley 30309',
    monto:            15000,
    tipo:             TipoMoneda.Soles,
    estado:           EstadoCot.Pendiente,
    observacion:      'Incluye levantamiento de gastos en I+D y elaboración de expediente técnico',
    id_author:        1,
    created_at:       '2025-03-15T08:00:00Z',
    updated_at:       '2025-03-15T08:00:00Z',
    contacto_nombre:  'Roxana Salcedo Mora',
    organizacion_nombre: 'Municipalidad de Miraflores',
    periodo:          'marzo 2025',
  },
  {
    id:               2,
    codigo:           'COT-2025-004',
    id_lead:          4,
    id_remitente:     1,
    fecha_cot:        '2025-03-11T08:00:00Z',
    dirigido:         'Patricia Ccopa Mamani',
    cliente:          'Industrias Mayo S.A.C. (Altomayo)',
    producto:         'Consultoría Innovación',
    nombre_remitente: 'Administración',
    nombre_servicio:  'Diagnóstico de capacidades tecnológicas y hoja de ruta de innovación para línea café specialty',
    monto:            6500,
    tipo:             TipoMoneda.Soles,
    estado:           EstadoCot.Enviada,
    observacion:      'Incluye dos visitas técnicas a planta y entrega de informe con roadmap de innovación.',
    id_author:        1,
    created_at:       '2025-03-11T08:00:00Z',
    updated_at:       '2025-03-11T08:00:00Z',
    contacto_nombre:  'Patricia Ccopa Mamani',
    organizacion_nombre: 'Altomayo',
    periodo:          'marzo 2025',
  },
  {
    id:               3,
    codigo:           'COT-2025-005',
    id_lead:          3,
    id_remitente:     2,
    fecha_cot:        '2025-04-05T08:00:00Z',
    dirigido:         'Rafael Benavides Sotelo',
    cliente:          'Inversiones Pisco S.A.',
    producto:         'Formulación I+D',
    nombre_remitente: 'Luis Torres',
    nombre_servicio:  'Calificación de proyectos de mejora tecnológica para deducción Ley 30309',
    monto:            11000,
    tipo:             TipoMoneda.Soles,
    estado:           EstadoCot.Enviada,
    id_author:        2,
    created_at:       '2025-04-05T08:00:00Z',
    updated_at:       '2025-04-05T08:00:00Z',
    contacto_nombre:  'Rafael Benavides Sotelo',
    organizacion_nombre: 'Inversiones Pisco S.A.',
    periodo:          'abril 2025',
  },
  {
    id:               4,
    codigo:           'COT-2026-001',
    id_lead:          2,
    id_remitente:     4,
    fecha_cot:        '2026-01-15T08:00:00Z',
    dirigido:         'Contacto por definir',
    cliente:          'AgroTech Innova',
    producto:         'Ley 30309 - Deducción I+D+i',
    nombre_remitente: 'Carlos Mamani',
    nombre_servicio:  'Ley 30309 - Deducción I+D+i',
    monto:            0,
    tipo:             TipoMoneda.Soles,
    estado:           EstadoCot.Pendiente,
    observacion:      'Cotización inicial generada automáticamente para lead en prospecto.',
    id_author:        2,
    created_at:       '2026-01-15T08:00:00Z',
    updated_at:       '2026-01-15T08:00:00Z',
    lead_codigo:      'LEAD-2026-001',
    organizacion_nombre: 'AgroTech Innova',
    periodo:          'Enero 2026',
  },
]

const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetCotizaciones = async (
  filtros?: CotizacionFiltros
): Promise<CotizacionesResponse> => {
  await delay()

  let resultado = [...MOCK_COTIZACIONES]

  if (filtros?.id_lead) {
    resultado = resultado.filter((c) => c.id_lead === filtros.id_lead)
  }

  if (filtros?.estado) {
    resultado = resultado.filter((c) => c.estado === filtros.estado)
  }

  if (filtros?.id_remitente) {
    resultado = resultado.filter((c) => c.id_remitente === filtros.id_remitente)
  }

  const page  = filtros?.page  ?? 1
  const limit = filtros?.limit ?? 10
  const start = (page - 1) * limit
  const data  = resultado.slice(start, start + limit)

  return { data, total: resultado.length, page, limit }
}

export const mockGetCotizacion = async (id: number): Promise<Cotizacion> => {
  await delay(400)
  const cot = MOCK_COTIZACIONES.find((c) => c.id === id)
  if (!cot) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  return cot
}

export const mockCreateCotizacion = async (
  data: CotizacionFormData
): Promise<Cotizacion> => {
  await delay()

  const nueva: Cotizacion = {
    id:               Date.now(),
    codigo:           `COT-${new Date().getFullYear()}-${String(MOCK_COTIZACIONES.length + 1).padStart(3, '0')}`,
    id_lead:          data.id_lead,
    id_remitente:     data.id_remitente,
    fecha_cot:        data.fecha_cot,
    dirigido:         data.dirigido,
    cliente:          data.cliente,
    producto:         data.producto,
    nombre_remitente: 'Administración',
    nombre_servicio:  data.nombre_servicio,
    monto:            data.monto,
    tipo:             data.tipo,
    estado:           EstadoCot.Pendiente,     // siempre PENDIENTE al crear
    observacion:      data.observacion,
    link_propuesta:   data.link_propuesta,
    id_author:        1,
    created_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
    periodo: new Date(data.fecha_cot).toLocaleDateString('es-PE', {
      month: 'long',
      year:  'numeric',
    }),
  }

  MOCK_COTIZACIONES.push(nueva)
  return nueva
}

export const mockUpdateCotizacion = async (
  id: number,
  data: Partial<CotizacionFormData>
): Promise<Cotizacion> => {
  await delay()

  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })

  const actual = MOCK_COTIZACIONES[index]
  if (actual.estado === EstadoCot.Aceptada || actual.estado === EstadoCot.Rechazada) {
    throw Object.assign(new Error('No se puede modificar una cotización en estado terminal.'), { status: 400 })
  }

  MOCK_COTIZACIONES[index] = {
    ...actual,
    ...data,
    updated_at: new Date().toISOString(),
  }
  return MOCK_COTIZACIONES[index]
}

export const mockEnviarCotizacion = async (id: number): Promise<Cotizacion> => {
  await delay(400)
  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  if (MOCK_COTIZACIONES[index].estado !== EstadoCot.Pendiente) {
    throw Object.assign(new Error('Solo se puede enviar una cotización Pendiente.'), { status: 400 })
  }
  MOCK_COTIZACIONES[index] = {
    ...MOCK_COTIZACIONES[index],
    estado:     EstadoCot.Enviada,
    updated_at: new Date().toISOString(),
  }
  return MOCK_COTIZACIONES[index]
}

export const mockAceptarCotizacion = async (id: number): Promise<Cotizacion> => {
  await delay(400)
  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  const { estado } = MOCK_COTIZACIONES[index]
  if (estado !== EstadoCot.Pendiente && estado !== EstadoCot.Enviada) {
    throw Object.assign(new Error('Solo se puede aceptar una cotización Pendiente o Enviada.'), { status: 400 })
  }
  MOCK_COTIZACIONES[index] = {
    ...MOCK_COTIZACIONES[index],
    estado:     EstadoCot.Aceptada,
    updated_at: new Date().toISOString(),
  }
  return MOCK_COTIZACIONES[index]
}

export const mockRechazarCotizacion = async (id: number): Promise<Cotizacion> => {
  await delay(400)
  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  const { estado } = MOCK_COTIZACIONES[index]
  if (estado !== EstadoCot.Pendiente && estado !== EstadoCot.Enviada) {
    throw Object.assign(new Error('Solo se puede rechazar una cotización Pendiente o Enviada.'), { status: 400 })
  }
  MOCK_COTIZACIONES[index] = {
    ...MOCK_COTIZACIONES[index],
    estado:     EstadoCot.Rechazada,
    updated_at: new Date().toISOString(),
  }
  return MOCK_COTIZACIONES[index]
}

export const mockEliminarCotizacion = async (id: number): Promise<void> => {
  await delay(400)
  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  MOCK_COTIZACIONES.splice(index, 1)
}

export const mockDeleteCotizacion = async (id: number): Promise<void> => {
  await delay(300)

  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Cotización no encontrada.'), { status: 404 })
  }

  MOCK_COTIZACIONES.splice(index, 1)
}

export const mockGetKpis = async (): Promise<CotizacionKpis> => {
  await delay(300)
  const aceptadas  = MOCK_COTIZACIONES.filter((c) => c.estado === EstadoCot.Aceptada)
  const enviadas   = MOCK_COTIZACIONES.filter((c) => c.estado === EstadoCot.Enviada)
  const rechazadas = MOCK_COTIZACIONES.filter((c) => c.estado === EstadoCot.Rechazada)
  const totalActivo = MOCK_COTIZACIONES
    .filter((c) => c.estado !== EstadoCot.Rechazada)
    .reduce((sum, c) => sum + c.monto, 0)
  return {
    totalActivo,
    aceptadas:  aceptadas.length,
    enviadas:   enviadas.length,
    rechazadas: rechazadas.length,
  }
}
