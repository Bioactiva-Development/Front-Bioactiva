import { act, renderHook } from '@testing-library/react'

const replaceMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}))

const refreshMock = jest.fn()
jest.mock('@/services/modules/auth.service', () => ({
  authService: { refresh: refreshMock },
}))

let mockAccessToken: string | null = 'token-123'
let mockTokenExpiresAt: number | null = Date.now() + 120000
const mockUpdateToken = jest.fn()
const mockClearSession = jest.fn()

jest.mock('@/store/auth.store', () => ({
  useAuthStore: Object.assign(
    (selector?: (s: Record<string, unknown>) => unknown) => {
      const state = {
        accessToken: mockAccessToken,
        tokenExpiresAt: mockTokenExpiresAt,
        updateToken: mockUpdateToken,
        clearSession: mockClearSession,
      }
      return typeof selector === 'function' ? selector(state) : state
    },
    { getState: () => ({}), setState: jest.fn() },
  ),
}))

jest.mock('@/lib/constants/config', () => ({
  TOKEN_KEY: 'bioactiva_token',
  USE_MOCK: false,
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { auth: { login: '/login' } },
}))

import { useProactiveRefresh } from '@/hooks/auth/useProactiveRefresh'

describe('auth/useProactiveRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    localStorage.clear()
    mockAccessToken = 'token-123'
    mockTokenExpiresAt = Date.now() + 120000
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does nothing when no accessToken', () => {
    mockAccessToken = null
    const { result } = renderHook(() => useProactiveRefresh())
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('does nothing when tokenExpiresAt is null', () => {
    mockTokenExpiresAt = null
    renderHook(() => useProactiveRefresh())
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('schedules refresh and calls service after delay', async () => {
    refreshMock.mockResolvedValueOnce({ accessToken: 'new-token', accessTokenExpiresIn: 3600 })

    renderHook(() => useProactiveRefresh())
    expect(refreshMock).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(60000) })
    await act(async () => { await Promise.resolve() })

    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect(mockUpdateToken).toHaveBeenCalledWith('new-token', 3600)
  })

  it('clears session and redirects on refresh failure', async () => {
    refreshMock.mockRejectedValueOnce(new Error('Token expired'))

    renderHook(() => useProactiveRefresh())
    act(() => { jest.advanceTimersByTime(60000) })
    await act(async () => { await Promise.resolve() })

    expect(mockClearSession).toHaveBeenCalled()
    expect(replaceMock).toHaveBeenCalledWith('/login')
  })

  it('saves new token to localStorage on refresh', async () => {
    refreshMock.mockResolvedValueOnce({ accessToken: 'stored-token', accessTokenExpiresIn: 3600 })

    renderHook(() => useProactiveRefresh())
    act(() => { jest.advanceTimersByTime(60000) })
    await act(async () => { await Promise.resolve() })

    expect(localStorage.getItem('bioactiva_token')).toBe('stored-token')
  })

  it('cleans up timer on unmount', () => {
    const { unmount } = renderHook(() => useProactiveRefresh())
    unmount()

    act(() => { jest.advanceTimersByTime(60000) })
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('triggers refresh when tab becomes visible and token is near expiry', async () => {
    mockTokenExpiresAt = Date.now() + 30000
    refreshMock.mockResolvedValueOnce({ accessToken: 'refresh-on-visible', accessTokenExpiresIn: 3600 })

    renderHook(() => useProactiveRefresh())

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await act(async () => { await Promise.resolve() })

    expect(refreshMock).toHaveBeenCalled()
  })

  it('does not refresh when tab is not visible', () => {
    renderHook(() => useProactiveRefresh())

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('does not refresh on visibility change when token is not near expiry', () => {
    mockTokenExpiresAt = Date.now() + 300000
    renderHook(() => useProactiveRefresh())

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('handles visibility change when accessToken is null', () => {
    mockAccessToken = null
    renderHook(() => useProactiveRefresh())

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refreshMock).not.toHaveBeenCalled()
  })
})
