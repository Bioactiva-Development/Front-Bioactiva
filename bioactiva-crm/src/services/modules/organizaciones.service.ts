import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetOrganizaciones,
  mockGetOrganizacion,
  mockCreateOrganizacion,
  mockUpdateOrganizacion,
  mockDeleteOrganizacion,
  mockSunatPorRuc,
  mockSunatPorNombre,
  mockGetOrganizacionConRelaciones,
} from '@/services/mock/organizaciones.mock'

import {
  Organizacion,
  OrganizacionFiltros,
  OrganizacionesResponse,
  OrganizacionFormData,
  SunatRucResult,
  SunatNombreResult,
  OrganizacionConRelaciones,
} from '@/types/organizacion.types'

import {
  OrganizacionDtoOut,
  OrganizacionConRelacionesDto,
  SunatRucDto,
  fromOrganizacionDto,
  fromSunatNombreDto,
  fromSunatRucDto,
  toCreateOrganizacionDto,
  toUpdateOrganizacionDto,
} from './organizaciones.mapper'
import { fromLeadDto, LeadDtoOut, LeadsDtoResponse } from './leads.mapper'
import { fromCotizacionDto, CotizacionDtoOut, CotizacionesDtoResponse } from './cotizaciones.mapper'

/**
 * Servicio de organizaciones.
 *
 * Mapea el contrato del backend NestJS (`Módulo organizations`, ver
 * `Documentación de endpoints por módulo`) al modelo de dominio del frontend.
 *
 * Endpoints expuestos por el backend:
 *  - POST   /organizations
 *  - GET    /organizations
 *  - GET    /organizations/sunat/:query     (detecta RUC vs razón social)
 *  - GET    /organizations/:id
 *  - PATCH  /organizations/:id
 */

const RUC_REGEX = /^\d{11}$/

const isRuc = (query: string) => RUC_REGEX.test(query.trim())

/**
 * Lista de organizaciones. El backend retorna un array plano; los filtros y la
 * paginación se aplican en cliente hasta que el backend los soporte.
 */
const aplicarFiltrosClientSide = (
  data: Organizacion[],
  filtros?: OrganizacionFiltros
): OrganizacionesResponse => {
  let filtradas = data

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    filtradas = filtradas.filter(
      (o) =>
        o.nombre.toLowerCase().includes(q) ||
        o.nombre_comercial.toLowerCase().includes(q) ||
        (o.ruc ?? '').includes(q) ||
        o.codigo_cliente.toLowerCase().includes(q)
    )
  }
  if (filtros?.sector) filtradas = filtradas.filter((o) => o.sector === filtros.sector)
  if (filtros?.tamano) filtradas = filtradas.filter((o) => o.tamano === filtros.tamano)
  if (filtros?.tipo) filtradas = filtradas.filter((o) => o.tipo === filtros.tipo)

  const page = filtros?.page ?? 1
  const limit = filtros?.limit ?? 20
  const start = (page - 1) * limit
  const end = start + limit
  return {
    data: filtradas.slice(start, end),
    total: filtradas.length,
    page,
    limit,
  }
}

export const organizacionesService = {
  /** GET /organizations */
  getAll: async (
    filtros?: OrganizacionFiltros
  ): Promise<OrganizacionesResponse> => {
    if (USE_MOCK) return mockGetOrganizaciones(filtros)

    const { data } = await apiClient.get<OrganizacionDtoOut[]>(
      ENDPOINTS.organizaciones.list
    )
    const organizaciones = data.map(fromOrganizacionDto)
    return aplicarFiltrosClientSide(organizaciones, filtros)
  },

  /** GET /organizations/:id */
  getById: async (id: string): Promise<Organizacion> => {
    if (USE_MOCK) return mockGetOrganizacion(id)
    const { data } = await apiClient.get<OrganizacionDtoOut>(
      ENDPOINTS.organizaciones.detail(id)
    )
    return fromOrganizacionDto(data)
  },

  /**
   * POST /organizations
   *
   * `idAuthor` es obligatorio: el backend espera explícitamente quién crea el
   * registro. Debe obtenerse del `useAuthStore` en el hook que invoca este
   * servicio.
   */
  create: async (
    data: OrganizacionFormData,
    idAuthor: number
  ): Promise<Organizacion> => {
    if (USE_MOCK) return mockCreateOrganizacion(data)
    const payload = toCreateOrganizacionDto(data, idAuthor)
    const { data: created } = await apiClient.post<OrganizacionDtoOut>(
      ENDPOINTS.organizaciones.create,
      payload
    )
    return fromOrganizacionDto(created)
  },

  /** PATCH /organizations/:id */
  update: async (
    id: string,
    data: Partial<OrganizacionFormData>
  ): Promise<Organizacion> => {
    if (USE_MOCK) return mockUpdateOrganizacion(id, data)
    const payload = toUpdateOrganizacionDto(data)
    const { data: updated } = await apiClient.patch<OrganizacionDtoOut>(
      ENDPOINTS.organizaciones.update(id),
      payload
    )
    return fromOrganizacionDto(updated)
  },

  /**
   * GET /organizations/sunat/:query — versión unificada.
   * Si `query` tiene 11 dígitos numéricos, el backend hace búsqueda por RUC
   * (devuelve un objeto). Si no, busca por razón social (devuelve un arreglo).
   *
   * NOTA: el backend ejecuta web scraping al portal SUNAT, lo cual puede tardar
   * 10–25 s. El timeout por defecto del apiClient (10 s) es insuficiente, por
   * eso aquí se sobreescribe a 30 s.
   */
  sunatPorRuc: async (ruc: string): Promise<SunatRucResult> => {
    if (USE_MOCK) return mockSunatPorRuc(ruc)
    const { data } = await apiClient.get<SunatRucDto>(
      ENDPOINTS.organizaciones.sunat,
      { params: { query: ruc }, timeout: 30000 }
    )
    return fromSunatRucDto(data)
  },

  sunatPorNombre: async (nombre: string): Promise<SunatNombreResult[]> => {
    if (USE_MOCK) return mockSunatPorNombre(nombre)
    if (isRuc(nombre)) {
      // Si por error se recibió un RUC, devolver un único resultado consistente.
      const ruc = await organizacionesService.sunatPorRuc(nombre)
      return [{ ruc: ruc.ruc, nombre: ruc.nombre, ubicacion: ruc.ubicacion }]
    }
    const { data } = await apiClient.get<SunatRucDto[]>(
      ENDPOINTS.organizaciones.sunat,
      { params: { query: nombre }, timeout: 30000 }
    )
    // El doc indica que se muestran hasta los 10 primeros más coincidentes (CU003).
    return data.slice(0, 10).map(fromSunatNombreDto)
  },

  /** DELETE /organizations/:id */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) return mockDeleteOrganizacion(id)
    await apiClient.delete(ENDPOINTS.organizaciones.delete(id))
  },

  /**
   * Carga la organización junto con sus contactos, leads y cotizaciones
   * asociadas usando 4 llamadas en paralelo. Si los endpoints de leads o
   * cotizaciones no soportan aún el filtro `idOrg`, degradan a [] sin romper
   * la vista (Promise.allSettled).
   */
  getByIdConRelaciones: async (
    id: string
  ): Promise<OrganizacionConRelaciones> => {
    if (USE_MOCK) return mockGetOrganizacionConRelaciones(id)

    const [orgResult, contactosResult, leadsResult, cotizacionesResult] =
      await Promise.allSettled([
        apiClient.get<OrganizacionConRelacionesDto>(ENDPOINTS.organizaciones.detail(id)),
        apiClient.get<Record<string, unknown>[]>(ENDPOINTS.contactos.byOrganizacion(id)),
        apiClient.get<LeadDtoOut[] | LeadsDtoResponse>(ENDPOINTS.leads.list, {
          params: { idOrg: id, limit: 100 },
        }),
        apiClient.get<CotizacionDtoOut[] | CotizacionesDtoResponse>(
          ENDPOINTS.cotizaciones.list,
          { params: { idOrg: id, limit: 100 } }
        ),
      ])

    if (orgResult.status === 'rejected') throw orgResult.reason

    const organizacion = fromOrganizacionDto(orgResult.value.data)

    const contactosRaw =
      contactosResult.status === 'fulfilled' ? contactosResult.value.data : []

    const leadsRaw: LeadDtoOut[] =
      leadsResult.status === 'fulfilled'
        ? Array.isArray(leadsResult.value.data)
          ? leadsResult.value.data
          : (leadsResult.value.data as LeadsDtoResponse).data ?? []
        : []

    const cotizacionesRaw: CotizacionDtoOut[] =
      cotizacionesResult.status === 'fulfilled'
        ? Array.isArray(cotizacionesResult.value.data)
          ? cotizacionesResult.value.data
          : (cotizacionesResult.value.data as CotizacionesDtoResponse).data ?? []
        : []

    const todosContactos = contactosRaw.map((c) => ({
      id:        Number(c.id),
      nombres:   String(c.nombres ?? ''),
      apellidos: String(c.apellidos ?? ''),
      vocativo:  c.vocativo as string | undefined,
      cargo:     (c.cargo as string | null) ?? undefined,
      correo:    String(c.correo ?? ''),
      telefono:  (c.telefono as string | null) ?? undefined,
    }))

    return {
      ...organizacion,
      contactos:      todosContactos.slice(0, 6),
      totalContactos: todosContactos.length,
      leads: leadsRaw.map((l) => {
        const lead = fromLeadDto(l)
        return {
          id:               lead.id,
          servicio_interes: lead.servicio_interes,
          estado:           lead.estado as string,
          created_at:       lead.created_at,
          encargado:        lead.encargado_nombre,
        }
      }),
      cotizaciones: cotizacionesRaw.map((c) => {
        const cot = fromCotizacionDto(c)
        return {
          id:               cot.id,
          nombre_servicio:  cot.nombre_servicio,
          monto:            cot.monto,
          tipo:             cot.tipo as string,
          estado:           cot.estado as string,
          fecha_cot:        cot.fecha_cot,
          dirigido:         cot.dirigido || undefined,
          nombre_remitente: cot.nombre_remitente || undefined,
          observacion:      cot.observacion ?? undefined,
          id_lead:          cot.id_lead,
          codigo_lead:      cot.codigo,
        }
      }),
    }
  },
}
