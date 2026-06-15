import { IntegracionesResponse, IntegracionAuthUrlResponse } from '@/types/integracion.types'

export function mockGetIntegraciones(): IntegracionesResponse {
    return {
        teams: { tipo: 'microsoft_teams', conectado: false, cuenta: undefined },
        outlook: { tipo: 'microsoft_outlook', conectado: false, cuenta: undefined },
    }
}

export function mockGetMicrosoftAuthUrl(): IntegracionAuthUrlResponse {
    // En modo mock no hay flujo OAuth real
    throw new Error('La integración con Microsoft estará disponible cuando se configure el servidor oficial.')
}

export function mockDisconnectMicrosoft(): void {
    throw new Error('No hay integración activa que desconectar.')
}
