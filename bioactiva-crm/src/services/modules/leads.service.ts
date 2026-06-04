import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetPipeline,
  mockGetLeads,
  mockGetLead,
  mockCreateLead,
  mockUpdateLead,
  mockUpdateEstadoLead,
} from '@/services/mock/leads.mock'
import {
  Lead,
  LeadFiltros,
  LeadsResponse,
  LeadFormData,
  PipelineData,
} from '@/types/lead.types'
import { LeadState } from '@/types/enums'
import {
  BackendLead,
  BackendLeadsResponse,
  mapBackendLead,
  mapBackendLeadsResponse,
  mapLeadFormToBackend,
  mapEstadoToBackend,
} from '@/services/modules/leads.adapter'

export const leadsService = {

  getPipeline: async (): Promise<PipelineData> => {
    if (USE_MOCK) return mockGetPipeline()
    const response = await apiClient.get<BackendLeadsResponse>(
      ENDPOINTS.leads.list,
      { params: { limit: 500 } }
    )
    const leads = response.data.data.map(mapBackendLead)
    return {
      prospecto:      leads.filter((l) => l.estado === LeadState.Prospecto),
      ofertado:       leads.filter((l) => l.estado === LeadState.Ofertado),
      cierreVenta:    leads.filter((l) => l.estado === LeadState.CierreVenta),
      cierreSinVenta: leads.filter((l) => l.estado === LeadState.CierreSinVenta),
      total:          leads.length,
    }
  },

  getAll: async (filtros?: LeadFiltros): Promise<LeadsResponse> => {
    if (USE_MOCK) return mockGetLeads(filtros)
    const response = await apiClient.get<BackendLeadsResponse>(
      ENDPOINTS.leads.list,
      { params: filtros }
    )
    return mapBackendLeadsResponse(response.data)
  },

  getById: async (id: number): Promise<Lead> => {
    if (USE_MOCK) return mockGetLead(id)
    const response = await apiClient.get<BackendLead>(
      ENDPOINTS.leads.detail(id)
    )
    return mapBackendLead(response.data)
  },

  create: async (data: LeadFormData): Promise<Lead> => {
    if (USE_MOCK) return mockCreateLead(data)
    const response = await apiClient.post<BackendLead>(
      ENDPOINTS.leads.create,
      mapLeadFormToBackend(data)
    )
    return mapBackendLead(response.data)
  },

  update: async (
    id: number,
    data: Partial<LeadFormData>
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateLead(id, data)
    const response = await apiClient.patch<BackendLead>(
      ENDPOINTS.leads.update(id),
      mapLeadFormToBackend(data)
    )
    return mapBackendLead(response.data)
  },

  updateEstado: async (
    id: number,
    estado: LeadState
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateEstadoLead(id, estado)
    const response = await apiClient.patch<BackendLead>(
      ENDPOINTS.leads.updateEstado(id),
      { estado: mapEstadoToBackend(estado) }
    )
    return mapBackendLead(response.data)
  },
}
