import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, TOKEN_KEY, COOKIE_TOKEN, COOKIE_ROL } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'
import { useAuthStore } from '@/store/auth.store'

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function forceLogout(): void {
    if (globalThis.window === undefined) return
    useAuthStore.getState().clearSession()
    document.cookie = `${COOKIE_TOKEN}=; path=/; max-age=0; SameSite=Lax`
    document.cookie = `${COOKIE_ROL}=; path=/; max-age=0; SameSite=Lax`
    // Si ya estamos en /login no redirigimos de nuevo (evita parpadeos / bucles).
    if (globalThis.location.pathname.startsWith(ROUTES.auth.login)) return
    // Mantis #271/#104: señalizamos a /login que la sesión caducó o fue
    // invalidada (login en otro dispositivo / cambio de rol) para mostrar el aviso.
    globalThis.location.href = `${ROUTES.auth.login}?expired=1`
}

// (El regex de JWT expirado fue removido según requerimientos del Mantis:
// no depender de mensajes específicos del backend y confiar en cualquier 401)

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })
    failedQueue = []
}

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (globalThis.window !== undefined) {
            const token = localStorage.getItem(TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error: AxiosError) => Promise.reject(error)
)


type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

const shouldAttemptRefresh = (error: AxiosError, req: RetryableRequest): boolean =>
    error.response?.status === 401 &&
    !req._retry &&
    !req.url?.includes('/auth/refresh') &&
    !req.url?.includes('/auth/login')

// Refresca el token y reintenta la petición original. Si ya hay un refresh en
// curso, encola la petición hasta que termine (evita múltiples /auth/refresh).
const refreshAndRetry = async (originalRequest: RetryableRequest) => {
    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({
                resolve: token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    resolve(apiClient(originalRequest))
                },
                reject,
            })
        })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
        const { data } = await apiClient.post<{ accessToken: string; accessTokenExpiresIn: number }>(
            '/auth/refresh',
        )

        const newToken = data.accessToken

        if (globalThis.window !== undefined) {
            localStorage.setItem(TOKEN_KEY, newToken)
        }

        useAuthStore.getState().updateToken(newToken, data.accessTokenExpiresIn)
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)
        return apiClient(originalRequest)
    } catch (refreshError) {
        processQueue(refreshError, null)
        forceLogout()
        throw refreshError
    } finally {
        isRefreshing = false
    }
}

const extractBackendMessage = (error: AxiosError): string | string[] | undefined => {
    const data = error.response?.data
    if (typeof data === 'string' && data.length > 0) return data
    return (data as { message?: string | string[] } | undefined)?.message
}

const resolveErrorMessage = (error: AxiosError, backendMessage: string | string[] | undefined): string => {
    // Mostrar todos los mensajes de validación, no solo el primero
    if (Array.isArray(backendMessage)) return backendMessage.join('. ')
    if (backendMessage) return backendMessage
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message))
        return 'La consulta tardó demasiado en responder. Inténtalo nuevamente.'
    if (error.response) return 'Ocurrió un error inesperado'
    return 'No se pudo conectar con el servidor. Verifica tu conexión.'
}

// Nunca exponer detalles internos de Prisma o la base de datos al usuario.
// Se usan tests separados para tolerar saltos de línea en el mensaje del backend.
const sanitizeSensitiveMessage = (mensaje: string): string => {
    const hasUniqueConstraint = /unique constraint|constraint failed on the fields/i.test(mensaje)
    const hasPrismaTrace      = /prisma|invalid [^\n]*invocation|p\d{4}/i.test(mensaje)

    if (hasUniqueConstraint && /correo/i.test(mensaje))
        return 'Ya existe un usuario o invitación registrado con ese correo electrónico.'
    if (hasUniqueConstraint)
        return 'Ya existe un registro con esos datos. Verifica e inténtalo nuevamente.'
    if (hasPrismaTrace)
        return 'Ocurrió un error al procesar la solicitud. Inténtalo nuevamente.'
    return mensaje
}


apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest

        if (shouldAttemptRefresh(error, originalRequest)) {
            return refreshAndRetry(originalRequest)
        }

        // 403: rol insuficiente — el refresh no ayuda (doc: "401 vs 403")
        if (error.response?.status === 403) {
            throw Object.assign(new Error('No tienes permisos para realizar esta acción.'), {
                status: 403,
                errorCode: (error.response.data as { error?: string })?.error,
                data: error.response.data,
            })
        }

        const backendMessage = extractBackendMessage(error)
        const rawMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage ?? ''

        if (
            error.response?.status === 401 &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/invitations') &&
            !originalRequest.url?.includes('/reset-password')
        ) {
            forceLogout()
            throw Object.assign(new Error(rawMessage || 'Su sesión ha expirado o no es válida.'), { status: error.response?.status })
        }

        const mensajeFinal = sanitizeSensitiveMessage(resolveErrorMessage(error, backendMessage))

        // errorCode: identificador estable del extended shape (ej: "ActivityNotFoundException")
        const errorCode = (error.response?.data as { error?: string })?.error

        throw Object.assign(new Error(mensajeFinal), {
            status: error.response?.status,
            errorCode,
            data: error.response?.data,
        })
    }
)

export { apiClient }
