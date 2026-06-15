import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetActividades,
  mockCreateActividad,
  mockUpdateActividad,
  mockDeleteActividad,
  mockCompleteActividad,
  mockCancelarActividad,
  mockGetComentarios,
  mockCreateComentario,
} from '@/services/mock/leads.mock'
import {
  Actividad,
  ActividadFormData,
  ComentarioActividad,
} from '@/types/actividad.types'
import {
  ActividadesDtoResponse,
  ActividadDtoOut,
  fromActividadDto,
  toActividadQueryParams,
  toCreateActividadDto,
  toUpdateActividadDto,
} from './actividades.mapper'

type RawActividadesResponse = ActividadDtoOut[] | ActividadesDtoResponse

const normalizeActividadesResponse = (
  raw: RawActividadesResponse
): Actividad[] => {
  if (Array.isArray(raw)) return raw.map(fromActividadDto)
  return raw.data.map(fromActividadDto)
}

export const actividadesService = {

  getByLead: async (leadId: number): Promise<Actividad[]> => {
    if (USE_MOCK) return mockGetActividades(leadId)
    const response = await apiClient.get<RawActividadesResponse>(
      ENDPOINTS.actividades.list,
      {
        params: {
          ...toActividadQueryParams({ id_lead: leadId }),
          page: 1,
          limit: 100,
        },
      }
    )
    return normalizeActividadesResponse(response.data)
  },

  create: async (data: ActividadFormData): Promise<Actividad> => {
    if (USE_MOCK) return mockCreateActividad(data)
    const response = await apiClient.post<ActividadDtoOut>(
      ENDPOINTS.actividades.create,
      toCreateActividadDto(data)
    )
    return fromActividadDto(response.data)
  },

  update: async (
    id: number,
    data: Partial<ActividadFormData>
  ): Promise<Actividad> => {
    if (USE_MOCK) return mockUpdateActividad(id, data)
    const response = await apiClient.patch<ActividadDtoOut>(
      ENDPOINTS.actividades.update(id),
      toUpdateActividadDto(data)
    )
    return fromActividadDto(response.data)
  },

  createCalendarEvent: async (id: number): Promise<Actividad> => {
    if (USE_MOCK) return mockUpdateActividad(id, {
      outlook_event_id: `mock-outlook-${id}`,
      outlook_imported: true,
      teamsMeetingUrl: `https://teams.microsoft.com/l/meetup-join/mock-${id}`,
    })

    const response = await apiClient.post<ActividadDtoOut>(
      ENDPOINTS.actividades.calendarEvent(id)
    )
    return fromActividadDto(response.data)
  },

  complete: async (id: number, notas?: string): Promise<Actividad> => {
    if (!USE_MOCK && notas?.trim()) {
      await actividadesService.update(id, { notas })
    }

    const actividad = USE_MOCK
      ? await mockCompleteActividad(id, notas)
      : fromActividadDto((await apiClient.patch<ActividadDtoOut>(
          ENDPOINTS.actividades.complete(id)
        )).data)

    return actividad
  },

  cancel: async (id: number): Promise<Actividad> => {
    const actividad = USE_MOCK
      ? await mockCancelarActividad(id)
      : fromActividadDto((await apiClient.patch<ActividadDtoOut>(
          ENDPOINTS.actividades.cancel(id)
        )).data)

    return actividad
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeleteActividad(id)
    await apiClient.delete(ENDPOINTS.actividades.delete(id))
  },

  // Los comentarios no están en la documentación oficial del backend.
  // Se mantienen para el modo mock; confirmar endpoint con el equipo de backend.
  getComentarios: async (actividadId: number): Promise<ComentarioActividad[]> => {
    if (USE_MOCK) return mockGetComentarios(actividadId)
    const response = await apiClient.get<ComentarioActividad[]>(
      `/activities/${actividadId}/comentarios`
    )
    return response.data
  },

  createComentario: async (
    actividadId: number,
    texto: string,
    autor: string
  ): Promise<ComentarioActividad> => {
    if (USE_MOCK) return mockCreateComentario(actividadId, texto, autor)
    const response = await apiClient.post<ComentarioActividad>(
      `/activities/${actividadId}/comentarios`,
      { texto }
    )
    return response.data
  },
}
