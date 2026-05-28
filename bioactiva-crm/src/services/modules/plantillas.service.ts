import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetPlantillas,
  mockGetPlantillasActivas,
  mockGetPlantilla,
  mockCreatePlantilla,
  mockUpdatePlantilla,
  mockDeletePlantilla,
} from '@/services/mock/plantillas.mock'
import { Plantilla, PlantillaFiltros } from '@/types/plantilla.types'

export const plantillasService = {

  getAll: async (filtros?: PlantillaFiltros): Promise<Plantilla[]> => {
    if (USE_MOCK) return mockGetPlantillas(filtros)
    const response = await apiClient.get<Plantilla[]>(
      ENDPOINTS.plantillas.list,
      { params: filtros }
    )
    return response.data
  },

  getActivas: async (): Promise<Plantilla[]> => {
    if (USE_MOCK) return mockGetPlantillasActivas()
    const response = await apiClient.get<Plantilla[]>(
      ENDPOINTS.plantillas.activas
    )
    return response.data
  },

  getById: async (id: number): Promise<Plantilla> => {
    if (USE_MOCK) return mockGetPlantilla(id)
    const response = await apiClient.get<Plantilla>(
      ENDPOINTS.plantillas.detail(id)
    )
    return response.data
  },

  create: async (data: Partial<Plantilla>): Promise<Plantilla> => {
    if (USE_MOCK) return mockCreatePlantilla(data)
    const response = await apiClient.post<Plantilla>(
      ENDPOINTS.plantillas.create,
      data
    )
    return response.data
  },

  // --- ACTUALIZAR ---
  update: async (
    id: number,
    data: Partial<Plantilla>
  ): Promise<Plantilla> => {
    if (USE_MOCK) return mockUpdatePlantilla(id, data)
    const response = await apiClient.patch<Plantilla>(
      ENDPOINTS.plantillas.update(id),
      data
    )
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) return mockDeletePlantilla(id)
    await apiClient.delete(ENDPOINTS.plantillas.delete(id))
  },
}