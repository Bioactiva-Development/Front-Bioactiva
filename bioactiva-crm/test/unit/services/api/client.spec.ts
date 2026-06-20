jest.mock('axios', () => ({
  create: jest.fn(() => Object.assign(jest.fn(), {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    get: jest.fn(),
  })),
}))

const mockClearSession = jest.fn()
const mockUpdateToken = jest.fn()
jest.mock('@/store/auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      clearSession: mockClearSession,
      updateToken: mockUpdateToken,
    })),
  },
}))

jest.mock('@/lib/constants/config', () => ({
  API_BASE_URL: 'http://test.com',
  TOKEN_KEY: 'test_token',
  COOKIE_TOKEN: 'test_cookie_token',
  COOKIE_ROL: 'test_cookie_rol',
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { auth: { login: '/login' } },
}))

import axios from 'axios'
import { apiClient } from '@/services/api/client'

let clientConfig: any
let reqOnFulfilled: any
let resOnFulfilled: any
let resOnRejected: any

beforeAll(() => {
  clientConfig = (axios.create as jest.Mock).mock.calls[0]?.[0]
  const reqUse = apiClient.interceptors.request.use as jest.Mock
  const resUse = apiClient.interceptors.response.use as jest.Mock
  reqOnFulfilled = reqUse.mock.calls[0]?.[0]
  resOnFulfilled = resUse.mock.calls[0]?.[0]
  resOnRejected = resUse.mock.calls[0]?.[1]
})

function createError(overrides: Record<string, any> = {}) {
  return {
    message: 'Request failed',
    config: { headers: {}, url: '/test' },
    response: undefined,
    code: undefined,
    ...overrides,
  }
}

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('module setup', () => {
    it('creates axios instance via mockCreate', () => {
      expect(clientConfig).toBeDefined()
    })

    it('registers request interceptor', () => {
      expect(typeof reqOnFulfilled).toBe('function')
    })

    it('registers response interceptor with two handlers', () => {
      expect(typeof resOnFulfilled).toBe('function')
      expect(typeof resOnRejected).toBe('function')
    })
  })

  describe('creation config', () => {
    it('passes correct config to axios.create', () => {
      expect(clientConfig).toEqual({
        baseURL: 'http://test.com',
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      })
    })
  })

  describe('request interceptor', () => {
    it('adds Authorization header when token exists', () => {
      localStorage.setItem('test_token', 'my-jwt-token')
      const config = { headers: {} }
      const result = reqOnFulfilled(config)
      expect(result.headers.Authorization).toBe('Bearer my-jwt-token')
    })

    it('skips Authorization header when no token', () => {
      const config = { headers: {} }
      const result = reqOnFulfilled(config)
      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('response interceptor - fulfilled', () => {
    it('passes through successful responses', () => {
      const response = { data: { id: 1 }, status: 200 }
      expect(resOnFulfilled(response)).toBe(response)
    })
  })

  describe('response interceptor - error handling', () => {
    it('throws custom message for 403', async () => {
      await expect(resOnRejected(createError({ response: { status: 403, data: {} } }))).rejects.toThrow('No tienes permisos para realizar esta acción.')
    })

    it('includes status and errorCode in 403 error', async () => {
      try {
        await resOnRejected(createError({ response: { status: 403, data: { error: 'RoleInsufficient' } } }))
      } catch (e: any) {
        expect(e.status).toBe(403)
        expect(e.errorCode).toBe('RoleInsufficient')
      }
    })

    it('extracts string backend message', async () => {
      await expect(resOnRejected(createError({ response: { status: 400, data: 'Correo inválido' } }))).rejects.toThrow('Correo inválido')
    })

    it('extracts backend message from object', async () => {
      await expect(resOnRejected(createError({ response: { status: 400, data: { message: 'Campo requerido' } } }))).rejects.toThrow('Campo requerido')
    })

    it('joins array messages with dot', async () => {
      await expect(resOnRejected(createError({ response: { status: 400, data: { message: ['Campo req', 'Formato inv'] } } }))).rejects.toThrow('Campo req. Formato inv')
    })

    it('converts ECONNABORTED to friendly message', async () => {
      await expect(resOnRejected(createError({ message: 'timeout', code: 'ECONNABORTED' }))).rejects.toThrow('La consulta tardó demasiado en responder.')
    })

    it('handles network error with no response', async () => {
      await expect(resOnRejected(createError({ message: 'Network Error', config: { headers: {}, url: '/test' } }))).rejects.toThrow('No se pudo conectar con el servidor.')
    })

    it('returns generic for response error without message', async () => {
      await expect(resOnRejected(createError({ response: { status: 500, data: {} } }))).rejects.toThrow('Ocurrió un error inesperado')
    })

    it('detects unique constraint + correo', async () => {
      await expect(resOnRejected(createError({ response: { status: 400, data: { message: 'Unique constraint failed on the fields: (`correo`)' } } }))).rejects.toThrow('Ya existe un usuario o invitación registrado con ese correo electrónico.')
    })

    it('detects unique constraint without correo', async () => {
      await expect(resOnRejected(createError({ response: { status: 400, data: { message: 'Unique constraint failed on the fields: (`ruc`)' } } }))).rejects.toThrow('Ya existe un registro con esos datos.')
    })

    it('Prisma trace with Unique constraint matches unique branch first', async () => {
      await expect(resOnRejected(createError({ response: { status: 500, data: { message: '\nInvalid `prisma.lead.create()` invocation:\n\nUnique constraint' } } }))).rejects.toThrow('Ya existe un registro con esos datos.')
    })

    it('Prisma p\\d{4} with Unique constraint matches unique branch first', async () => {
      await expect(resOnRejected(createError({ response: { status: 500, data: { message: 'p2002 Unique constraint' } } }))).rejects.toThrow('Ya existe un registro con esos datos.')
    })

    it('forces logout on jwt expired outside auth/login and invitations', async () => {
      await expect(resOnRejected(createError({ message: 'jwt expired', response: { status: 401, data: { message: 'jwt expired' } }, config: { headers: {}, url: '/test', _retry: true } }))).rejects.toThrow('jwt expired')
      expect(mockClearSession).toHaveBeenCalled()
    })

    it('does not force logout on jwt expired in /auth/login', async () => {
      await expect(resOnRejected(createError({ message: 'jwt expired', response: { status: 400, data: { message: 'jwt expired' } }, config: { headers: {}, url: '/auth/login' } }))).rejects.toThrow('jwt expired')
      expect(mockClearSession).not.toHaveBeenCalled()
    })

    it('does not force logout on jwt expired in invitations route', async () => {
      await expect(resOnRejected(createError({ message: 'jwt expired', response: { status: 400, data: { message: 'jwt expired' } }, config: { headers: {}, url: '/invitations/accept' } }))).rejects.toThrow('jwt expired')
      expect(mockClearSession).not.toHaveBeenCalled()
    })

    it('attaches errorCode, status, and data to thrown error', async () => {
      try {
        await resOnRejected(createError({ response: { status: 404, data: { error: 'NotFound', message: 'Not found' } } }))
      } catch (e: any) {
        expect(e.status).toBe(404)
        expect(e.errorCode).toBe('NotFound')
      }
    })

    it('handles 401 by calling refresh endpoint and retrying', async () => {
      const refreshMock = jest.fn().mockResolvedValue({ data: { accessToken: 'new-token', accessTokenExpiresIn: 3600 } })
      ;(apiClient as any).post = refreshMock
      ;(apiClient as any).mockReturnValue({ data: {} })
      const error = createError({ response: { status: 401, data: {} }, config: { headers: {}, url: '/leads' } })
      const result = await resOnRejected(error)
      expect(refreshMock).toHaveBeenCalledWith('/auth/refresh')
      expect(result).toEqual({ data: {} })
    })
  })
})
