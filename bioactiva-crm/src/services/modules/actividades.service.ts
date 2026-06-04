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
  BackendActividad,
  mapBackendActividad,
  mapActividadFormToBackend,
  mapActividadUpdateToBackend,
} from '@/services/modules/actividades.adapter'

export const actividadesService = {

  getByLead: async (leadId: number): Promise<Actividad[]> => {
    if (USE_MOCK) return mockGetActividades(leadId)
    const response = await apiClient.get<{ data: BackendActividad[] }>(
      ENDPOINTS.actividades.list,
      { params: { idLead: leadId, limit: 200 } }
    )
    return response.data.data.map(mapBackendActividad)
  },

  create: async (data: ActividadFormData): Promise<Actividad> => {
    if (USE_MOCK) return mockCreateActividad(data)
    const response = await apiClient.post<BackendActividad>(
      ENDPOINTS.actividades.create,
      mapActividadFormToBackend(data)
    )
    return mapBackendActividad(response.data)
  },

  update: async (
    id: number,
    data: Partial<ActividadFormData>
  ): Promise<Actividad> => {
    if (USE_MOCK) return mockUpdateActividad(id, data)
    const response = await apiClient.patch<BackendActividad>(
      ENDPOINTS.actividades.update(id),
      mapActividadUpdateToBackend(data)
    )
    return mapBackendActividad(response.data)
  },

  complete: async (id: number): Promise<Actividad> => {
    if (USE_MOCK) return mockCompleteActividad(id)
    const response = await apiClient.patch<BackendActividad>(
      ENDPOINTS.actividades.complete(id)
    )
    return mapBackendActividad(response.data)
  },

  cancel: async (id: number): Promise<Actividad> => {
    if (USE_MOCK) return mockCancelarActividad(id)
    const response = await apiClient.patch<BackendActividad>(
      ENDPOINTS.actividades.cancel(id)
    )
    return mapBackendActividad(response.data)
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
      `/activities/${actividadId}/comments`
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
      `/activities/${actividadId}/comments`,
      { texto }
    )
    return response.data
  },
}
