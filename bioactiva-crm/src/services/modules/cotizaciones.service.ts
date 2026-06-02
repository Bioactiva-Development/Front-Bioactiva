import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetCotizaciones,
  mockGetCotizacion,
  mockCreateCotizacion,
  mockUpdateCotizacion,
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

async function syncLeadEstadoFromCotizacion(cotizacion: Cotizacion) {
  const leadState = getLeadStateFromCotizacion(cotizacion.estado)
  if (!leadState) return
  await leadsService.updateEstado(cotizacion.id_lead, leadState)
}

async function applyCotizacionEstado(
  cotizacion: Cotizacion,
  targetEstado?: EstadoCot
): Promise<Cotizacion> {
  if (!targetEstado || targetEstado === cotizacion.estado) return cotizacion

  if (targetEstado === EstadoCot.Pendiente) return cotizacion

  const endpoint =
    targetEstado === EstadoCot.Enviada
      ? ENDPOINTS.cotizaciones.send(cotizacion.id)
      : targetEstado === EstadoCot.Aceptada
        ? ENDPOINTS.cotizaciones.accept(cotizacion.id)
        : ENDPOINTS.cotizaciones.reject(cotizacion.id)

  const response = await apiClient.patch<CotizacionDtoOut>(endpoint)
  return fromCotizacionDto(response.data)
}

export const cotizacionesService = {

  getAll: async (filtros?: CotizacionFiltros): Promise<CotizacionesResponse> => {
    if (USE_MOCK) return mockGetCotizaciones(filtros)
    const response = await apiClient.get<RawCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: toCotizacionQueryParams(filtros) }
    )
    return normalizeCotizacionesResponse(response.data, filtros)
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
    const { data } = await cotizacionesService.getAll({ limit: 100 })
    const aceptadas = data.filter((c) => c.estado === EstadoCot.Aceptada).length
    const enviadas = data.filter((c) => c.estado === EstadoCot.Enviada).length
    const totalActivo = data.filter((c) => c.estado !== EstadoCot.Rechazada).length
    const procesadas = data.filter(
      (c) => c.estado === EstadoCot.Enviada || c.estado === EstadoCot.Aceptada
    ).length

    return {
      totalActivo,
      aceptadas,
      enviadas,
      conversion: procesadas > 0 ? aceptadas / procesadas : 0,
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
}
