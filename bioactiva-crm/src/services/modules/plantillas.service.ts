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
import { Plantilla, PlantillaFormData } from '@/types/plantilla.types'

function normalizePlantilla(raw: Record<string, unknown>): Plantilla {
    return {
        id:        Number(raw.id),
        nombre:    String(raw.nombre ?? ''),
        asunto:    String(raw.asunto ?? ''),
        cuerpo:    String(raw.cuerpo ?? ''),
        activo:    Boolean(raw.activo ?? true),
        createdAt: String(raw.createdAt ?? ''),
        updatedAt: String(raw.updatedAt ?? raw.createdAt ?? ''),
    }
}

export const plantillasService = {

    getAll: async (includeInactive = false): Promise<Plantilla[]> => {
        if (USE_MOCK) return mockGetPlantillas(includeInactive)
        const response = await apiClient.get<Record<string, unknown>[]>(
            ENDPOINTS.plantillas.list,
            { params: includeInactive ? { includeInactive: true } : {} },
        )
        return response.data.map(normalizePlantilla)
    },

    getActivas: async (): Promise<Plantilla[]> => {
        if (USE_MOCK) return mockGetPlantillasActivas()
        const response = await apiClient.get<Record<string, unknown>[]>(
            ENDPOINTS.plantillas.activas,
        )
        return response.data.map(normalizePlantilla)
    },

    getById: async (id: number): Promise<Plantilla> => {
        if (USE_MOCK) return mockGetPlantilla(id)
        const response = await apiClient.get<Record<string, unknown>>(
            ENDPOINTS.plantillas.detail(id),
        )
        return normalizePlantilla(response.data)
    },

    create: async (data: PlantillaFormData): Promise<Plantilla> => {
        if (USE_MOCK) return mockCreatePlantilla(data)
        const response = await apiClient.post<Record<string, unknown>>(
            ENDPOINTS.plantillas.create,
            data,
        )
        return normalizePlantilla(response.data)
    },

    update: async (id: number, data: Partial<PlantillaFormData>): Promise<Plantilla> => {
        if (USE_MOCK) return mockUpdatePlantilla(id, data)
        const response = await apiClient.patch<Record<string, unknown>>(
            ENDPOINTS.plantillas.update(id),
            data,
        )
        return normalizePlantilla(response.data)
    },

    delete: async (id: number): Promise<void> => {
        if (USE_MOCK) return mockDeletePlantilla(id)
        await apiClient.delete(ENDPOINTS.plantillas.delete(id))
    },

    desactivar: async (id: number): Promise<Plantilla> => {
        return plantillasService.update(id, { activo: false })
    },
}
