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
    if (typeof window === 'undefined') return
    useAuthStore.getState().clearSession()
    document.cookie = `${COOKIE_TOKEN}=; path=/; max-age=0; SameSite=Strict`
    document.cookie = `${COOKIE_ROL}=; path=/; max-age=0; SameSite=Strict`
    window.location.href = ROUTES.auth.login
}

// Solo mensajes que indican expiración/invalidez del JWT de sesión del usuario.
// Patrones genéricos como "token.*expired" quedan excluidos a propósito para
// no confundir errores de tokens de invitación o recuperación con la sesión.
const JWT_EXPIRED_PATTERN = /jwt expired|jwt malformed|invalid signature/i

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
        if (typeof window != 'undefined') {
            const token = localStorage.getItem(TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error: AxiosError) => Promise.reject(error)
)


apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
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

                if (typeof window !== 'undefined') {
                    localStorage.setItem(TOKEN_KEY, newToken)
                }

                useAuthStore.getState().updateToken(newToken, data.accessTokenExpiresIn)
                originalRequest.headers.Authorization = `Bearer ${newToken}`

                processQueue(null, newToken)
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                forceLogout()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // 403: rol insuficiente — el refresh no ayuda (doc: "401 vs 403")
        if (error.response?.status === 403) {
            return Promise.reject({
                status: 403,
                message: 'No tienes permisos para realizar esta acción.',
                errorCode: (error.response.data as { error?: string })?.error,
                data: error.response.data,
            })
        }

        const backendMessage =
            (error.response?.data as { message?: string | string[] })?.message

        const rawMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage ?? ''

        if (
            JWT_EXPIRED_PATTERN.test(rawMessage) &&
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/invitations')
        ) {
            forceLogout()
            return Promise.reject({ status: error.response?.status, message: rawMessage })
        }

        let mensajeFinal: string
        if (Array.isArray(backendMessage)) {
            // Mostrar todos los mensajes de validación, no solo el primero
            mensajeFinal = backendMessage.join('. ')
        } else if (backendMessage) {
            mensajeFinal = backendMessage
        } else if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
            mensajeFinal = 'La consulta tardó demasiado en responder. Inténtalo nuevamente.'
        } else if (!error.response) {
            mensajeFinal = 'No se pudo conectar con el servidor. Verifica tu conexión.'
        } else {
            mensajeFinal = 'Ocurrió un error inesperado'
        }

        // errorCode: identificador estable del extended shape (ej: "ActivityNotFoundException")
        const errorCode = (error.response?.data as { error?: string })?.error

        return Promise.reject({
            status: error.response?.status,
            message: mensajeFinal,
            errorCode,
            data: error.response?.data,
        })
    }
)

export { apiClient }
