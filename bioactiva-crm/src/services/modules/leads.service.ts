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

export const leadsService = {

  getPipeline: async (filtros?: LeadFiltros): Promise<PipelineData> => {
    if (USE_MOCK) return mockGetPipeline(filtros)
    const response = await apiClient.get<PipelineData>(
      ENDPOINTS.leads.pipeline,
      { params: filtros }
    )
    return response.data
  },

  getAll: async (filtros?: LeadFiltros): Promise<LeadsResponse> => {
    if (USE_MOCK) return mockGetLeads(filtros)
    const response = await apiClient.get<LeadsResponse>(
      ENDPOINTS.leads.list,
      { params: filtros }
    )
    return response.data
  },

  getById: async (id: number): Promise<Lead> => {
    if (USE_MOCK) return mockGetLead(id)
    const response = await apiClient.get<Lead>(
      ENDPOINTS.leads.detail(id)
    )
    return response.data
  },

  create: async (data: LeadFormData): Promise<Lead> => {
    if (USE_MOCK) return mockCreateLead(data)
    const response = await apiClient.post<Lead>(
      ENDPOINTS.leads.create,
      data
    )
    return response.data
  },

  update: async (
    id: number,
    data: Partial<LeadFormData>
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateLead(id, data)
    const response = await apiClient.patch<Lead>(
      ENDPOINTS.leads.update(id),
      data
    )
    return response.data
  },

  updateEstado: async (
    id: number,
    estado: LeadState
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateEstadoLead(id, estado)
    const response = await apiClient.patch<Lead>(
      ENDPOINTS.leads.updateEstado(id),
      { estado }
    )
    return response.data
  },
}