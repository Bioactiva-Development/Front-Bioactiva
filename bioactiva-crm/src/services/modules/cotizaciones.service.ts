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

function endpointForEstado(id: number, targetEstado: EstadoCot): string {
  if (targetEstado === EstadoCot.Enviada) return ENDPOINTS.cotizaciones.send(id)
  if (targetEstado === EstadoCot.Aceptada) return ENDPOINTS.cotizaciones.accept(id)
  return ENDPOINTS.cotizaciones.reject(id)
}

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
  if (USE_MOCK) return mockTransitionForEstado(id, targetEstado)
  const endpoint = endpointForEstado(id, targetEstado)
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
    if (USE_MOCK) return mockCreateCotizacion(data)
    const cotizacion = fromCotizacionDto((
      await apiClient.post<CotizacionDtoOut>(
        ENDPOINTS.cotizaciones.create,
        toCreateCotizacionDto(data)
      )
    ).data)
    return applyCotizacionEstado(cotizacion, data.estado)
  },

  update: async (
    id: number,
    data: Partial<CotizacionFormData>
  ): Promise<Cotizacion> => {
    if (USE_MOCK) return mockUpdateCotizacion(id, data)
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
  },

  getKpis: async (): Promise<CotizacionKpis> => {
    if (USE_MOCK) return mockGetKpis()
    const response = await apiClient.get<CotizacionKpis>(
      ENDPOINTS.cotizaciones.kpis
    )
    return response.data
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
