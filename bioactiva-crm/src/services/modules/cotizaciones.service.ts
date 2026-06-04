import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetCotizaciones,
  mockGetCotizacion,
  mockCreateCotizacion,
  mockUpdateCotizacion,
  mockEnviarCotizacion,
  mockAceptarCotizacion,
  mockRechazarCotizacion,
  mockEliminarCotizacion,
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
  BackendCotizacion,
  BackendCotizacionesResponse,
  mapBackendCotizacion,
  mapBackendCotizacionesResponse,
  mapCotizacionFormToBackend,
  mapCotizacionUpdateToBackend,
  mapCotizacionFiltrosToBackend,
} from '@/services/modules/cotizaciones.adapter'

export const cotizacionesService = {

  getAll: async (filtros?: CotizacionFiltros): Promise<CotizacionesResponse> => {
    if (USE_MOCK) return mockGetCotizaciones(filtros)
    const response = await apiClient.get<BackendCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: mapCotizacionFiltrosToBackend(filtros) }
    )
    return mapBackendCotizacionesResponse(response.data)
  },

  getById: async (id: number): Promise<Cotizacion> => {
    if (USE_MOCK) return mockGetCotizacion(id)
    const response = await apiClient.get<BackendCotizacion>(
      ENDPOINTS.cotizaciones.detail(id)
    )
    return mapBackendCotizacion(response.data)
  },

  getByLead: async (leadId: number): Promise<Cotizacion[]> => {
    if (USE_MOCK) {
      const response = await mockGetCotizaciones()
      return response.data.filter((c) => c.id_lead === leadId)
    }
    const response = await apiClient.get<BackendCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: { idLead: leadId, limit: 200 } }
    )
    return mapBackendCotizacionesResponse(response.data).data
  },

  create: async (data: CotizacionFormData): Promise<Cotizacion> => {
    if (USE_MOCK) return mockCreateCotizacion(data)
    const response = await apiClient.post<BackendCotizacion>(
      ENDPOINTS.cotizaciones.create,
      mapCotizacionFormToBackend(data)
    )
    return mapBackendCotizacion(response.data)
  },

  update: async (
    id: number,
    data: Partial<CotizacionFormData>
  ): Promise<Cotizacion> => {
    if (USE_MOCK) return mockUpdateCotizacion(id, data)
    const response = await apiClient.patch<BackendCotizacion>(
      ENDPOINTS.cotizaciones.update(id),
      mapCotizacionUpdateToBackend(data)
    )
    return mapBackendCotizacion(response.data)
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockEliminarCotizacion(id)
    await apiClient.delete(ENDPOINTS.cotizaciones.delete(id))
  },

  send: async (id: number): Promise<Cotizacion> => {
    if (USE_MOCK) return mockEnviarCotizacion(id)
    const response = await apiClient.patch<BackendCotizacion>(
      ENDPOINTS.cotizaciones.send(id)
    )
    return mapBackendCotizacion(response.data)
  },

  accept: async (id: number): Promise<Cotizacion> => {
    if (USE_MOCK) return mockAceptarCotizacion(id)
    const response = await apiClient.patch<BackendCotizacion>(
      ENDPOINTS.cotizaciones.accept(id)
    )
    return mapBackendCotizacion(response.data)
  },

  reject: async (id: number): Promise<Cotizacion> => {
    if (USE_MOCK) return mockRechazarCotizacion(id)
    const response = await apiClient.patch<BackendCotizacion>(
      ENDPOINTS.cotizaciones.reject(id)
    )
    return mapBackendCotizacion(response.data)
  },

  getKpis: async (): Promise<CotizacionKpis> => {
    if (USE_MOCK) return mockGetKpis()
    // KPIs calculados localmente desde la lista de cotizaciones
    const response = await apiClient.get<BackendCotizacionesResponse>(
      ENDPOINTS.cotizaciones.list,
      { params: { limit: 500 } }
    )
    const cots = mapBackendCotizacionesResponse(response.data).data
    const aceptadas  = cots.filter((c) => c.estado === EstadoCot.Aceptada)
    const enviadas   = cots.filter((c) => c.estado === EstadoCot.Enviada)
    const totalActivo = cots
      .filter((c) => c.estado !== EstadoCot.Rechazada)
      .reduce((sum, c) => sum + c.monto, 0)
    const propuestas = enviadas.length + aceptadas.length
    return {
      totalActivo,
      aceptadas:  aceptadas.length,
      enviadas:   enviadas.length,
      conversion: propuestas > 0
        ? Math.round((aceptadas.length / propuestas) * 100)
        : 0,
    }
  },
}
