import { EstadoCot, TipoMoneda } from '@/types/enums'
import {
  Cotizacion,
  CotizacionFiltros,
  CotizacionesResponse,
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
    lead_codigo:      'LEAD-2025-003',
    contacto_nombre:  'Roxana Salcedo Mora',
    organizacion_nombre: 'Municipalidad de Miraflores',
    periodo:          'Marzo 2025',
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
    estado:           EstadoCot.Aceptada,
    observacion:      'Incluye dos visitas técnicas a planta y entrega de informe con roadmap de innovación.',
    id_author:        1,
    created_at:       '2025-03-11T08:00:00Z',
    updated_at:       '2025-03-11T08:00:00Z',
    lead_codigo:      'LEAD-2025-008',
    contacto_nombre:  'Patricia Ccopa Mamani',
    organizacion_nombre: 'Altomayo',
    periodo:          'Marzo 2025',
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
    lead_codigo:      'LEAD-2025-005',
    contacto_nombre:  'Rafael Benavides Sotelo',
    organizacion_nombre: 'Inversiones Pisco S.A.',
    periodo:          'Abril 2025',
  },
]

const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetCotizaciones = async (
  filtros?: CotizacionFiltros
): Promise<CotizacionesResponse> => {
  await delay()

  let resultado = [...MOCK_COTIZACIONES]

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    resultado = resultado.filter(
      (c) =>
        c.codigo.toLowerCase().includes(q) ||
        c.cliente.toLowerCase().includes(q) ||
        c.nombre_servicio.toLowerCase().includes(q) ||
        c.lead_codigo?.toLowerCase().includes(q) ||
        c.contacto_nombre?.toLowerCase().includes(q)
    )
  }

  if (filtros?.estado) {
    resultado = resultado.filter((c) => c.estado === filtros.estado)
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
  if (!cot) {
    throw { status: 404, message: 'Cotización no encontrada.' }
  }
  return cot
}

export const mockCreateCotizacion = async (
  data: Partial<Cotizacion>
): Promise<Cotizacion> => {
  await delay()

  const anio   = new Date().getFullYear()
  const codigo = `COT-${anio}-${String(MOCK_COTIZACIONES.length + 1).padStart(3, '0')}`

  const nueva: Cotizacion = {
    id:               Date.now(),
    codigo,
    id_lead:          data.id_lead!,
    id_remitente:     data.id_remitente!,
    fecha_cot:        data.fecha_cot!,
    dirigido:         data.dirigido!,
    cliente:          data.cliente!,
    producto:         data.producto,
    nombre_remitente: data.nombre_remitente!,
    nombre_servicio:  data.nombre_servicio!,
    monto:            data.monto!,
    tipo:             data.tipo!,
    estado:           data.estado!,
    observacion:      data.observacion,
    link_propuesta:   data.link_propuesta,
    id_author:        1,
    created_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
    lead_codigo:      data.lead_codigo,
    contacto_nombre:  data.contacto_nombre,
    organizacion_nombre: data.organizacion_nombre,
    periodo:          new Date(data.fecha_cot!).toLocaleDateString('es-PE', {
      month: 'long',
      year:  'numeric',
    }),
  }

  MOCK_COTIZACIONES.push(nueva)
  return nueva
}

export const mockUpdateCotizacion = async (
  id: number,
  data: Partial<Cotizacion>
): Promise<Cotizacion> => {
  await delay()

  const index = MOCK_COTIZACIONES.findIndex((c) => c.id === id)
  if (index === -1) {
    throw { status: 404, message: 'Cotización no encontrada.' }
  }

  const actualizada = {
    ...MOCK_COTIZACIONES[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_COTIZACIONES[index] = actualizada
  return actualizada
}

export const mockGetKpis = async (): Promise<CotizacionKpis> => {
  await delay(300)

  const aceptadas = MOCK_COTIZACIONES.filter(
    (c) => c.estado === EstadoCot.Aceptada
  )
  const enviadas = MOCK_COTIZACIONES.filter(
    (c) => c.estado === EstadoCot.Enviada
  )
  const totalActivo = MOCK_COTIZACIONES
    .filter((c) => c.estado !== EstadoCot.Rechazada)
    .reduce((sum, c) => sum + c.monto, 0)

  const propuestas = MOCK_COTIZACIONES.filter(
    (c) => c.estado === EstadoCot.Enviada || c.estado === EstadoCot.Aceptada
  ).length

  const conversion = propuestas > 0
    ? Math.round((aceptadas.length / propuestas) * 100)
    : 0

  return {
    totalActivo,
    aceptadas: aceptadas.length,
    enviadas:  enviadas.length,
    conversion,
  }
}