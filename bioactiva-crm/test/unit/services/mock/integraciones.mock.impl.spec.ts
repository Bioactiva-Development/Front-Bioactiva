import {
  mockGetIntegraciones,
  mockGetMicrosoftAuthUrl,
  mockDisconnectMicrosoft,
} from '@/services/mock/integraciones.mock'

describe('mocks/integraciones.mock (implementation)', () => {
  describe('mockGetIntegraciones', () => {
    it('returns integraciones status', () => {
      const result = mockGetIntegraciones()
      expect(result).toHaveProperty('teams')
      expect(result).toHaveProperty('outlook')
    })
  })

  describe('mockGetMicrosoftAuthUrl', () => {
    it('throws because no OAuth in mock mode', () => {
      expect(() => mockGetMicrosoftAuthUrl()).toThrow()
    })
  })

  describe('mockDisconnectMicrosoft', () => {
    it('throws because no integration to disconnect', () => {
      expect(() => mockDisconnectMicrosoft()).toThrow()
    })
  })
})
