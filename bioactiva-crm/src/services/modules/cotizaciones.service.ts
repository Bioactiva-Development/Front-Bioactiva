import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetCotizaciones,
  mockGetCotizacion,
  mockCreateCotizacion,
  mockUpdateCotizacion,
  mockDeleteCotizacion,
  mockEnviarCotizacion,
  mockAceptarCotizacion,
  mockRechazarCotizacion,
  mockGetKpis,
} from '@/services/mock/cotizaciones.mock'
import { leadsService } from '@/services/modules/leads.service'
import { getLeadStateFromCotizacion } from '@/lib/utils/lead-flow.utils'
import {
  Cotizacion,
  CotizacionFiltros,
  CotizacionesResponse,
  CotizacionFormData,
  CotizacionKpis,
} from '@/types/cotizacion.types'
import { EstadoCot } from '@/types/enums'
import {
  CotizacionDtoOut,
  CotizacionesDtoResponse,
  fromCotizacionDto,
  toCotizacionQueryParams,
  toCreateCotizacionDto,
  toUpdateCotizacionDto,
} from './cotizaciones.mapper'

type RawCotizacionesResponse = CotizacionDtoOut[] | CotizacionesDtoResponse
const SYNC_FETCH_LIMIT = 500

const normalizeCotizacionesResponse = (
  raw: RawCotizacionesResponse,
  filtros?: CotizacionFiltros
): CotizacionesResponse => {
  if (Array.isArray(raw)) {
    const data = raw.map(fromCotizacionDto)
    return {
      data,
      total: data.length,
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? data.length,
    }
  }

  const data = raw.data.map(fromCotizacionDto)
  return {
    data,
    total: raw.meta?.total ?? data.length,
    page: raw.meta?.page ?? filtros?.page ?? 1,
    limit: raw.meta?.limit ?? filtros?.limit ?? data.length,
  }
}

const paginateCotizaciones = (
  data: Cotizacion[],
  filtros?: CotizacionFiltros
): CotizacionesResponse => {
  const page = filtros?.page ?? 1
  const limit = filtros?.limit ?? data.length
  const start = (page - 1) * limit

  return {
    data: data.slice(start, start + limit),
    total: data.length,
    page,
    limit,
  }
}

const filterCotizaciones = (
  data: Cotizacion[],
  filtros?: CotizacionFiltros
) => {
  const search = filtros?.search?.trim().toLowerCase()

  return data.filter((cotizacion) => {
    if (filtros?.estado && cotizacion.estado !== filtros.estado) return false

    if (!search) return true

    return [
      cotizacion.codigo,
      cotizacion.dirigido,
      cotizacion.cliente,
      cotizacion.nombre_servicio,
      cotizacion.contacto_nombre,
      cotizacion.organizacion_nombre,
      cotizacion.producto,
    ].some((value) => value?.toLowerCase().includes(search))
  })
}

const getSyncedCotizaciones = async (): Promise<Cotizacion[]> => {
  const [pipeline, response] = await Promise.all([
    leadsService.getPipeline(),
    apiClient.get<RawCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: toCotizacionQueryParams({ limit: SYNC_FETCH_LIMIT }) }
    ),
  ])

  const activeLeadIds = new Set([
    ...pipeline.prospecto,
    ...pipeline.ofertado,
    ...pipeline.cierreVenta,
    ...pipeline.cierreSinVenta,
  ].map((lead) => lead.id))

  return normalizeCotizacionesResponse(
    response.data,
    { limit: SYNC_FETCH_LIMIT }
  ).data.filter((cotizacion) => activeLeadIds.has(cotizacion.id_lead))
}

async function syncLeadEstadoFromCotizacion(cotizacion: Cotizacion) {
  const leadState = getLeadStateFromCotizacion(cotizacion.estado)
  if (!leadState) return
  await leadsService.updateEstado(cotizacion.id_lead, leadState)
}

// Mapea el estado destino al endpoint de transición correspondiente.
function endpointForEstado(id: number, targetEstado: EstadoCot): string {
  if (targetEstado === EstadoCot.Enviada) return ENDPOINTS.cotizaciones.send(id)
  if (targetEstado === EstadoCot.Aceptada) return ENDPOINTS.cotizaciones.accept(id)
  return ENDPOINTS.cotizaciones.reject(id)
}

// Versión mock equivalente a endpointForEstado.
function mockTransitionForEstado(id: number, targetEstado: EstadoCot): Promise<Cotizacion> {
  if (targetEstado === EstadoCot.Enviada) return mockEnviarCotizacion(id)
  if (targetEstado === EstadoCot.Aceptada) return mockAceptarCotizacion(id)
  return mockRechazarCotizacion(id)
}

async function applyCotizacionEstado(
  cotizacion: Cotizacion,
  targetEstado?: EstadoCot
): Promise<Cotizacion> {
  if (!targetEstado || targetEstado === cotizacion.estado) return cotizacion

  if (targetEstado === EstadoCot.Pendiente) return cotizacion

  const endpoint = endpointForEstado(cotizacion.id, targetEstado)

  const response = await apiClient.patch<CotizacionDtoOut>(endpoint)
  return fromCotizacionDto(response.data)
}

async function transitionCotizacionEstado(
  id: number,
  targetEstado: EstadoCot
): Promise<Cotizacion> {
  let cotizacion: Cotizacion

  if (USE_MOCK) {
    cotizacion = await mockTransitionForEstado(id, targetEstado)
  } else {
    const endpoint = endpointForEstado(id, targetEstado)

    const response = await apiClient.patch<CotizacionDtoOut>(endpoint)
    cotizacion = fromCotizacionDto(response.data)
  }

  await syncLeadEstadoFromCotizacion(cotizacion)
  return cotizacion
}

export const cotizacionesService = {

  getAll: async (filtros?: CotizacionFiltros): Promise<CotizacionesResponse> => {
    if (USE_MOCK) return mockGetCotizaciones(filtros)
    const syncedCotizaciones = await getSyncedCotizaciones()
    return paginateCotizaciones(
      filterCotizaciones(syncedCotizaciones, filtros),
      filtros
    )
  },

  getById: async (id: number): Promise<Cotizacion> => {
    if (USE_MOCK) return mockGetCotizacion(id)
    const response = await apiClient.get<CotizacionDtoOut>(
      ENDPOINTS.cotizaciones.detail(id)
    )
    return fromCotizacionDto(response.data)
  },

  create: async (data: CotizacionFormData): Promise<Cotizacion> => {
    const cotizacion = USE_MOCK
      ? await mockCreateCotizacion(data)
      : await applyCotizacionEstado(
          fromCotizacionDto((
            await apiClient.post<CotizacionDtoOut>(
              ENDPOINTS.cotizaciones.create,
              toCreateCotizacionDto(data)
            )
          ).data),
          data.estado
        )

    await syncLeadEstadoFromCotizacion(cotizacion)
    return cotizacion
  },

  update: async (
    id: number,
    data: Partial<CotizacionFormData>
  ): Promise<Cotizacion> => {
    const cotizacion = USE_MOCK
      ? await mockUpdateCotizacion(id, data)
      : await (async () => {
          const payload = toUpdateCotizacionDto(data)
          const base = Object.keys(payload).length > 0
            ? fromCotizacionDto((
                await apiClient.patch<CotizacionDtoOut>(
                  ENDPOINTS.cotizaciones.update(id),
                  payload
                )
              ).data)
            : await cotizacionesService.getById(id)

          return applyCotizacionEstado(base, data.estado)
        })()

    await syncLeadEstadoFromCotizacion(cotizacion)
    return cotizacion
  },

  getKpis: async (): Promise<CotizacionKpis> => {
    if (USE_MOCK) return mockGetKpis()
    const data = await getSyncedCotizaciones()
    const aceptadas = data.filter((c) => c.estado === EstadoCot.Aceptada).length
    const enviadas = data.filter((c) => c.estado === EstadoCot.Enviada).length
    const rechazadas = data.filter((c) => c.estado === EstadoCot.Rechazada).length
    const totalActivo = data
      .filter((c) => c.estado !== EstadoCot.Rechazada)
      .reduce((sum, c) => sum + c.monto, 0)

    return {
      totalActivo,
      aceptadas,
      enviadas,
      rechazadas,
    }
  },

  getByLead: async (leadId: number): Promise<Cotizacion[]> => {
    if (USE_MOCK) {
      const response = await mockGetCotizaciones()
      return response.data.filter((c) => c.id_lead === leadId)
    }
    const response = await apiClient.get<RawCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: toCotizacionQueryParams({ idLead: leadId, limit: 100 }) }
    )
    return normalizeCotizacionesResponse(response.data, { limit: 100 }).data
  },

  enviar: (id: number): Promise<Cotizacion> =>
    transitionCotizacionEstado(id, EstadoCot.Enviada),

  aceptar: (id: number): Promise<Cotizacion> =>
    transitionCotizacionEstado(id, EstadoCot.Aceptada),

  rechazar: (id: number): Promise<Cotizacion> =>
    transitionCotizacionEstado(id, EstadoCot.Rechazada),

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeleteCotizacion(id)
    await apiClient.delete(ENDPOINTS.cotizaciones.delete(id))
  },
}
