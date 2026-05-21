import {USE_MOCK} from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetOrganizaciones,
  mockGetOrganizacion,
  mockCreateOrganizacion,
  mockUpdateOrganizacion,
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

const SUNAT_SERVICE_URL = 'https://a-frontend-bioactiva.onrender.com'

export const organizacionesService = {

  getAll: async (
    filtros?: OrganizacionFiltros
  ): Promise<OrganizacionesResponse> => {
    if (USE_MOCK) return mockGetOrganizaciones(filtros)
    const response = await apiClient.get<OrganizacionesResponse>(
      ENDPOINTS.organizaciones.list,
      { params: filtros }
    )
    return response.data
  },

  getById: async (id: string): Promise<Organizacion> => {
    if (USE_MOCK) return mockGetOrganizacion(id)
    const response = await apiClient.get<Organizacion>(
      ENDPOINTS.organizaciones.detail(id)
    )
    return response.data
  },

  create: async (data: OrganizacionFormData): Promise<Organizacion> => {
    if (USE_MOCK) return mockCreateOrganizacion(data)
    const response = await apiClient.post<Organizacion>(
      ENDPOINTS.organizaciones.create,
      data
    )
    return response.data
  },

  update: async (
    id: string,
    data: Partial<OrganizacionFormData>
  ): Promise<Organizacion> => {
    if (USE_MOCK) return mockUpdateOrganizacion(id, data)
    const response = await apiClient.patch<Organizacion>(
      ENDPOINTS.organizaciones.update(id),
      data
    )
    return response.data
  },

  sunatPorRuc: async (ruc: string): Promise<SunatRucResult> => {
      try {
        const response = await fetch(
          `${SUNAT_SERVICE_URL}/consultar-ruc?ruc=${ruc}`
        )
        if (!response.ok) {
          const error = await response.json()
          throw { status: response.status, message: error.detail ?? 'Error al consultar SUNAT.' }
        }
        return response.json()
      } catch (err: unknown) {
        console.warn('Servicio SUNAT no disponible, usando mock:', err)
        return mockSunatPorRuc(ruc)
      }
    },

    sunatPorNombre: async (nombre: string): Promise<SunatNombreResult[]> => {
      try {
        const response = await fetch(
          `${SUNAT_SERVICE_URL}/consultar-nombre?nombre=${encodeURIComponent(nombre)}`
        )
        if (!response.ok) {
          const error = await response.json()
          throw { status: response.status, message: error.detail ?? 'Error al consultar SUNAT.' }
        }
        return response.json()
      } catch (err: unknown) {
        console.warn('Servicio SUNAT no disponible, usando mock:', err)
        return mockSunatPorNombre(nombre)
      }
    },

  getByIdConRelaciones: async (id: string):Promise<OrganizacionConRelaciones> => {
    if (USE_MOCK) return mockGetOrganizacionConRelaciones(id)
    const response = await apiClient.get<OrganizacionConRelaciones>(
        `${ENDPOINTS.organizaciones.detail(id)}/relaciones`
    )
    return response.data
},
}

