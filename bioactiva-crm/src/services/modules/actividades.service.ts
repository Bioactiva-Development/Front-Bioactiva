import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetActividades,
  mockCreateActividad,
  mockUpdateActividad,
  mockDeleteActividad,
  mockCompleteActividad,
  mockGetComentarios,
  mockCreateComentario,
} from '@/services/mock/leads.mock'
import {
  Actividad,
  ActividadFormData,
  ComentarioActividad,
} from '@/types/actividad.types'
import { notificacionesService } from '@/services/modules/notificaciones.service'

export const actividadesService = {

  getByLead: async (leadId: number): Promise<Actividad[]> => {
    if (USE_MOCK) return mockGetActividades(leadId)
    const response = await apiClient.get<Actividad[]>(
      ENDPOINTS.actividades.byLead(leadId)
    )
    return response.data
  },

  create: async (data: ActividadFormData): Promise<Actividad> => {
    if (USE_MOCK) return mockCreateActividad(data)
    const response = await apiClient.post<Actividad>(
      ENDPOINTS.actividades.create(data.id_lead),
      data
    )
    return response.data
  },

  update: async (
    id: number,
    data: Partial<ActividadFormData>
  ): Promise<Actividad> => {
    if (USE_MOCK) return mockUpdateActividad(id, data)
    const response = await apiClient.patch<Actividad>(
      ENDPOINTS.actividades.update(id),
      data
    )
    return response.data
  },

  complete: async (id: number, notas?: string): Promise<Actividad> => {
    const actividad = USE_MOCK
      ? await mockCompleteActividad(id, notas)
      : (await apiClient.patch<Actividad>(
          ENDPOINTS.actividades.complete(id),
          notas ? { notas } : undefined
        )).data

    await notificacionesService.cancelarPendientesPorActividad(id)
    return actividad
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeleteActividad(id)
    await apiClient.delete(ENDPOINTS.actividades.delete(id))
  },

  getComentarios: async (
    actividadId: number
  ): Promise<ComentarioActividad[]> => {
    if (USE_MOCK) return mockGetComentarios(actividadId)
    const response = await apiClient.get<ComentarioActividad[]>(
      `/api/actividades/${actividadId}/comentarios`
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
      `/api/actividades/${actividadId}/comentarios`,
      { texto }
    )
    return response.data
  },
}
