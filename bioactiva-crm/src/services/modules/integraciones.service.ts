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
    MicrosoftStatusResponse,
} from '@/types/integracion.types'

// Mapea la respuesta compacta del backend { connected: boolean }
// al formato que usa el componente de perfil.
function mapStatusToIntegraciones(status: MicrosoftStatusResponse): IntegracionesResponse {
    return {
        teams:   { tipo: 'microsoft_teams',   conectado: status.connected },
        outlook: { tipo: 'microsoft_outlook', conectado: status.connected },
    }
}

export const integracionesService = {

    // GET /microsoft/status → { connected: boolean }
    getEstado: async (): Promise<IntegracionesResponse> => {
        if (USE_MOCK) return mockGetIntegraciones()
        const response = await apiClient.get<MicrosoftStatusResponse>(
            ENDPOINTS.integraciones.microsoftStatus
        )
        return mapStatusToIntegraciones(response.data)
    },

    // GET /microsoft/connect → { url: "https://login.microsoftonline.com/..." }
    getMicrosoftAuthUrl: async (): Promise<IntegracionAuthUrlResponse> => {
        if (USE_MOCK) return mockGetMicrosoftAuthUrl()
        const response = await apiClient.get<IntegracionAuthUrlResponse>(
            ENDPOINTS.integraciones.microsoftConnect
        )
        return response.data
    },

    // DELETE /microsoft/disconnect → { ok: true }
    disconnectMicrosoft: async (): Promise<void> => {
        if (USE_MOCK) return mockDisconnectMicrosoft()
        await apiClient.delete(ENDPOINTS.integraciones.microsoftDisconnect)
    },
}
