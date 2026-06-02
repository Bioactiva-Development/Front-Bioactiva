import { USE_MOCK } from '@/lib/constants/config'
import { ENDPOINTS } from '@/services/api/endpoints'
import { apiClient } from '@/services/api/client'
import {
    mockGetIntegraciones,
    mockGetMicrosoftAuthUrl,
    mockDisconnectMicrosoft,
} from '@/services/mock/integraciones.mock'
import {
    IntegracionesResponse,
    IntegracionAuthUrlResponse,
} from '@/types/integracion.types'

export const integracionesService = {
    getEstado: async (): Promise<IntegracionesResponse> => {
        if (USE_MOCK) return mockGetIntegraciones()
        const response = await apiClient.get<IntegracionesResponse>(ENDPOINTS.integraciones.list)
        return response.data
    },

    getMicrosoftAuthUrl: async (): Promise<IntegracionAuthUrlResponse> => {
        if (USE_MOCK) return mockGetMicrosoftAuthUrl()
        const response = await apiClient.get<IntegracionAuthUrlResponse>(
            ENDPOINTS.integraciones.microsoftAuthUrl,
        )
        return response.data
    },

    disconnectMicrosoft: async (): Promise<void> => {
        if (USE_MOCK) return mockDisconnectMicrosoft()
        await apiClient.delete(ENDPOINTS.integraciones.microsoftDisconnect)
    },
}
