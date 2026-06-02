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
  mockDeleteLead,
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
  fromLeadDto,
  LeadDtoOut,
  LeadsDtoResponse,
  toBackendLeadState,
  toCreateLeadDto,
  toLeadQueryParams,
  toUpdateLeadDto,
} from './leads.mapper'

const PAGE_SIZE_PIPELINE = 100

type RawLeadsResponse = LeadDtoOut[] | LeadsDtoResponse

const normalizeLeadsResponse = (
  raw: RawLeadsResponse,
  filtros?: LeadFiltros
): LeadsResponse => {
  if (Array.isArray(raw)) {
    const data = raw.map(fromLeadDto)
    return {
      data,
      total: data.length,
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? data.length,
    }
  }

  const data = raw.data.map(fromLeadDto)
  return {
    data,
    total: raw.meta?.total ?? data.length,
    page: raw.meta?.page ?? filtros?.page ?? 1,
    limit: raw.meta?.limit ?? filtros?.limit ?? data.length,
  }
}

const buildPipeline = (leads: Lead[]): PipelineData => ({
  prospecto: leads.filter((lead) => lead.estado === LeadState.Prospecto),
  ofertado: leads.filter((lead) => lead.estado === LeadState.Ofertado),
  cierreVenta: leads.filter((lead) => lead.estado === LeadState.CierreVenta),
  cierreSinVenta: leads.filter((lead) => lead.estado === LeadState.CierreSinVenta),
  total: leads.length,
})

const fetchLeadsPage = async (filtros?: LeadFiltros): Promise<LeadsResponse> => {
  const response = await apiClient.get<RawLeadsResponse>(
    ENDPOINTS.leads.list,
    { params: toLeadQueryParams(filtros) }
  )
  return normalizeLeadsResponse(response.data, filtros)
}

export const leadsService = {

  getPipeline: async (filtros?: LeadFiltros): Promise<PipelineData> => {
    if (USE_MOCK) return mockGetPipeline(filtros)

    const firstPage = await fetchLeadsPage({
      ...filtros,
      page: 1,
      limit: PAGE_SIZE_PIPELINE,
    })
    const totalPages = firstPage.limit > 0
      ? Math.ceil(firstPage.total / firstPage.limit)
      : 1

    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
        fetchLeadsPage({
          ...filtros,
          page: index + 2,
          limit: PAGE_SIZE_PIPELINE,
        })
      )
    )

    return buildPipeline([
      ...firstPage.data,
      ...remainingPages.flatMap((page) => page.data),
    ])
  },

  getAll: async (filtros?: LeadFiltros): Promise<LeadsResponse> => {
    if (USE_MOCK) return mockGetLeads(filtros)
    return fetchLeadsPage(filtros)
  },

  getById: async (id: number): Promise<Lead> => {
    if (USE_MOCK) return mockGetLead(id)
    const response = await apiClient.get<LeadDtoOut>(
      ENDPOINTS.leads.detail(id)
    )
    return fromLeadDto(response.data)
  },

  create: async (data: LeadFormData): Promise<Lead> => {
    if (USE_MOCK) return mockCreateLead(data)
    const response = await apiClient.post<LeadDtoOut>(
      ENDPOINTS.leads.create,
      toCreateLeadDto(data)
    )
    const lead = fromLeadDto(response.data)

    if (data.estado && data.estado !== LeadState.Prospecto) {
      return leadsService.updateEstado(lead.id, data.estado)
    }

    return lead
  },

  update: async (
    id: number,
    data: Partial<LeadFormData>
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateLead(id, data)
    const payload = toUpdateLeadDto(data)
    const hasBusinessPayload = Object.keys(payload).length > 0

    let lead = hasBusinessPayload
      ? fromLeadDto((
          await apiClient.patch<LeadDtoOut>(
            ENDPOINTS.leads.update(id),
            payload
          )
        ).data)
      : await leadsService.getById(id)

    if (data.estado && data.estado !== lead.estado) {
      lead = await leadsService.updateEstado(id, data.estado)
    }

    return lead
  },

  updateEstado: async (
    id: number,
    estado: LeadState
  ): Promise<Lead> => {
    if (USE_MOCK) return mockUpdateEstadoLead(id, estado)
    const response = await apiClient.patch<LeadDtoOut>(
      ENDPOINTS.leads.updateEstado(id),
      { estado: toBackendLeadState(estado) }
    )
    return fromLeadDto(response.data)
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeleteLead(id)
    await apiClient.delete(ENDPOINTS.leads.delete(id))
  },
}
