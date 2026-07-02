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
  PaginatedLeads,
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
import { isLeadStaleWithoutProgress } from '@/lib/utils/activity-flow.utils'

const PAGE_SIZE_PIPELINE = 100
// Tamaño de página por columna del pipeline ("cargar más"). Igual al default del backend.
const COLUMN_PAGE_SIZE = 10

type RawLeadsResponse = LeadDtoOut[] | LeadsDtoResponse
type LeadLocalFields = Pick<Lead, 'fecha_cierre'>
type LeadLocalFieldsMap = Record<number, LeadLocalFields>

const LOCAL_LEAD_FIELDS_KEY = 'bioactiva:lead-local-fields'

const canUseLocalStorage = () =>
  globalThis.window !== undefined && globalThis.localStorage !== undefined

const readLeadLocalFields = (): LeadLocalFieldsMap => {
  if (!canUseLocalStorage()) return {}

  try {
    return JSON.parse(
      globalThis.localStorage.getItem(LOCAL_LEAD_FIELDS_KEY) ?? '{}'
    ) as LeadLocalFieldsMap
  } catch {
    return {}
  }
}

const writeLeadLocalFields = (fields: LeadLocalFieldsMap) => {
  if (!canUseLocalStorage()) return
  globalThis.localStorage.setItem(LOCAL_LEAD_FIELDS_KEY, JSON.stringify(fields))
}

const mergeLeadLocalFields = (lead: Lead): Lead => {
  const localFields = readLeadLocalFields()[lead.id]
  if (!localFields) return lead
  return { ...lead, ...localFields }
}

const persistLeadLocalFields = (
  id: number,
  data: Partial<LeadFormData>
) => {
  if (!Object.hasOwn(data, 'fecha_cierre')) return

  const fields = readLeadLocalFields()
  const fechaCierre = data.fecha_cierre?.trim()

  if (fechaCierre) {
    fields[id] = { ...fields[id], fecha_cierre: fechaCierre }
  } else if (fields[id]) {
    delete fields[id].fecha_cierre
    if (Object.keys(fields[id]).length === 0) delete fields[id]
  }

  writeLeadLocalFields(fields)
}

const removeLeadLocalFields = (id: number) => {
  const fields = readLeadLocalFields()
  if (!fields[id]) return
  delete fields[id]
  writeLeadLocalFields(fields)
}

const normalizeLeadsResponse = (
  raw: RawLeadsResponse,
  filtros?: LeadFiltros
): LeadsResponse => {
  if (Array.isArray(raw)) {
    const data = raw.map(fromLeadDto).map(mergeLeadLocalFields)
    return {
      data,
      total: data.length,
      page: filtros?.page ?? 1,
      limit: filtros?.limit ?? data.length,
    }
  }

  const data = raw.data.map(fromLeadDto).map(mergeLeadLocalFields)
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

const applyClientFilters = (leads: Lead[], filtros?: LeadFiltros) =>
  leads.filter((lead) => {
    if (
      filtros?.canal_captacion &&
      lead.canal_captacion !== filtros.canal_captacion
    ) {
      return false
    }

    if (
      filtros?.solo_alerta &&
      !(lead.tiene_alerta || isLeadStaleWithoutProgress(lead))
    ) {
      return false
    }

    return true
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

    const leads = [
      ...firstPage.data,
      ...remainingPages.flatMap((page) => page.data),
    ]

    return buildPipeline(applyClientFilters(leads, filtros))
  },

  // Trae una página de leads de UNA columna (un estado) para el patrón
  // "cargar más" por columna. Filtrado y paginación 100% server-side.
  getLeadsColumn: async (
    estado: LeadState,
    filtros: LeadFiltros | undefined,
    page: number,
    limit = COLUMN_PAGE_SIZE
  ): Promise<PaginatedLeads> => {
    const conEstado: LeadFiltros = { ...filtros, estado, page, limit }

    if (USE_MOCK) {
      const todos = await mockGetLeads({ ...filtros, estado })
      const filtrados = todos.data.filter((lead) => lead.estado === estado)
      const total = filtrados.length
      const start = (page - 1) * limit
      return {
        data: filtrados.slice(start, start + limit),
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }
    }

    const response = await apiClient.get<RawLeadsResponse>(ENDPOINTS.leads.list, {
      params: toLeadQueryParams(conEstado),
    })
    const normalized = normalizeLeadsResponse(response.data, conEstado)
    const effectiveLimit = normalized.limit || limit
    return {
      data: normalized.data,
      page: normalized.page,
      limit: effectiveLimit,
      total: normalized.total,
      totalPages: Math.max(1, Math.ceil(normalized.total / effectiveLimit)),
    }
  },

  getByContacto: async (idContacto: number): Promise<Lead[]> => {
    if (USE_MOCK) {
      const firstPage = await fetchLeadsPage({ page: 1, limit: PAGE_SIZE_PIPELINE })
      const totalPages = firstPage.limit > 0
        ? Math.ceil(firstPage.total / firstPage.limit)
        : 1
      const remaining = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
          fetchLeadsPage({ page: i + 2, limit: PAGE_SIZE_PIPELINE })
        )
      )
      return [firstPage, ...remaining]
        .flatMap((page) => page.data)
        .filter((lead) => lead.id_contacto === idContacto)
    }
    const response = await fetchLeadsPage({ id_contacto: idContacto })
    return response.data
  },

  getAll: async (filtros?: LeadFiltros): Promise<LeadsResponse> => {
    if (USE_MOCK) return mockGetLeads(filtros)
    const response = await fetchLeadsPage(filtros)
    const data = applyClientFilters(response.data, filtros)
    return {
      ...response,
      data,
      total: data.length,
    }
  },

  getById: async (id: number): Promise<Lead> => {
    if (USE_MOCK) return mockGetLead(id)
    const response = await apiClient.get<LeadDtoOut>(
      ENDPOINTS.leads.detail(id)
    )
    return mergeLeadLocalFields(fromLeadDto(response.data))
  },

  create: async (data: LeadFormData): Promise<Lead> => {
    if (USE_MOCK) return mockCreateLead(data)
    const response = await apiClient.post<LeadDtoOut>(
      ENDPOINTS.leads.create,
      toCreateLeadDto(data)
    )
    const lead = fromLeadDto(response.data)
    persistLeadLocalFields(lead.id, data)

    if (data.estado && data.estado !== LeadState.Prospecto) {
      return mergeLeadLocalFields(
        await leadsService.updateEstado(lead.id, data.estado)
      )
    }

    return mergeLeadLocalFields(lead)
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

    persistLeadLocalFields(id, data)
    return mergeLeadLocalFields(lead)
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
    return mergeLeadLocalFields(fromLeadDto(response.data))
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeleteLead(id)
    await apiClient.delete(ENDPOINTS.leads.delete(id))
    removeLeadLocalFields(id)
  },
}
