import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
  mockGetContactos,
  mockGetContacto,
  mockCreateContacto,
  mockUpdateContacto,
} from '@/services/mock/contactos.mock'
import {
  Contacto,
  ContactoFiltros,
  ContactosResponse,
  ContactoFormData,
} from '@/types/contacto.types'

export const contactosService = {

  getAll: async (filtros?: ContactoFiltros): Promise<ContactosResponse> => {
    if (USE_MOCK) return mockGetContactos(filtros)
    const response = await apiClient.get<ContactosResponse>(
      ENDPOINTS.contactos.list,
      { params: filtros }
    )
    return response.data
  },

  getById: async (id: number): Promise<Contacto> => {
    if (USE_MOCK) return mockGetContacto(id)
    const response = await apiClient.get<Contacto>(
      ENDPOINTS.contactos.detail(id)
    )
    return response.data
  },

  create: async (data: ContactoFormData): Promise<Contacto> => {
    if (USE_MOCK) return mockCreateContacto(data)
    const response = await apiClient.post<Contacto>(
      ENDPOINTS.contactos.create,
      data
    )
    return response.data
  },

  update: async (
    id: number,
    data: Partial<ContactoFormData>
  ): Promise<Contacto> => {
    if (USE_MOCK) return mockUpdateContacto(id, data)
    const response = await apiClient.patch<Contacto>(
      ENDPOINTS.contactos.update(id),
      data
    )
    return response.data
  },

  getByOrganizacion: async (orgId: string): Promise<Contacto[]> => {
    if (USE_MOCK) {
      const response = await mockGetContactos({ id_organizacion: orgId })
      return response.data
    }
    const response = await apiClient.get<Contacto[]>(
      ENDPOINTS.contactos.byOrganizacion(orgId)
    )
    return response.data
  },
}