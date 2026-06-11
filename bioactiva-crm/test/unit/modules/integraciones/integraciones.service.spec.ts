jest.mock('@/lib/constants/config', () => ({ USE_MOCK: false }))

const getMock = jest.fn()
const deleteMock = jest.fn()

jest.mock('@/services/api/client', () => ({
  apiClient: { get: getMock, delete: deleteMock },
}))

import { integracionesService } from '@/services/modules/integraciones.service'

describe('integraciones/integraciones.service (API mode)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getEstado', () => {
    it('fetches and maps microsoft status (connected)', async () => {
      getMock.mockResolvedValueOnce({ data: { connected: true } })

      const result = await integracionesService.getEstado()
      expect(getMock).toHaveBeenCalledWith('/microsoft/status')
      expect(result.teams.conectado).toBe(true)
      expect(result.outlook.conectado).toBe(true)
    })

    it('fetches and maps microsoft status (disconnected)', async () => {
      getMock.mockResolvedValueOnce({ data: { connected: false } })

      const result = await integracionesService.getEstado()
      expect(result.teams.conectado).toBe(false)
      expect(result.outlook.conectado).toBe(false)
    })
  })

  describe('getMicrosoftAuthUrl', () => {
    it('fetches microsoft auth url', async () => {
      getMock.mockResolvedValueOnce({ data: { url: 'https://login.microsoftonline.com/auth' } })

      const result = await integracionesService.getMicrosoftAuthUrl()
      expect(getMock).toHaveBeenCalledWith('/microsoft/connect')
      expect(result.url).toBe('https://login.microsoftonline.com/auth')
    })
  })

  describe('disconnectMicrosoft', () => {
    it('disconnects microsoft integration', async () => {
      deleteMock.mockResolvedValueOnce({})
      await integracionesService.disconnectMicrosoft()
      expect(deleteMock).toHaveBeenCalledWith('/microsoft/disconnect')
    })
  })
})
