import { RolUsuario, EstadoUsuario, TokenPurpose, EstadoToken } from '@/types/enums'
import {
    LoginRequest, LoginResponse, ForgotPasswordResponse, ResetPasswordResponse,
    ValidateTokenResponse, Usuario,
} from '@/types/auth.types'
import { useAuthStore } from '@/store/auth.store'


const MOCK_USUARIOS: Usuario[] = [
    {
        id: 1,
        nombres: 'Carlos',
        apellidos: 'Ramírez',
        correo: 'admin@bioactiva.pe',
        rol: RolUsuario.Administrador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z'
    },
    {
        id: 2,
        nombres: 'María',
        apellidos: 'Torres',
        correo: 'maria@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoUsuario.Activo,
        created_at: '2025-01-05T08:00:00Z',
        updated_at: '2025-01-05T08:00:00Z',
    },
    {
        id: 3,
        nombres: 'Juan',
        apellidos: 'López',
        correo: 'juan@bioactiva.pe',
        rol: RolUsuario.Trabajador,
        estado: EstadoUsuario.Inactivo,
        created_at: '2025-01-10T08:00:00Z',
        updated_at: '2025-01-10T08:00:00Z',
    },
]

const MOCK_TOKENS = [
    {
        token: 'token-recuperacion-valido-123',
        correo: 'maria@bioactiva.pe',
        proposito: TokenPurpose.Recuperacion,
        estado: EstadoToken.Pendiente,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
    },
    {
        token: 'token-activacion-valido-456',
        correo: 'nuevo@bioactiva.pe',
        proposito: TokenPurpose.Activacion,
        estado: EstadoToken.Pendiente,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
    },
    {
        token: 'token-expirado-789',
        correo: 'otro@bioactiva.pe',
        proposito: TokenPurpose.Recuperacion,
        estado: EstadoToken.Expirado,
        expires_at: new Date(Date.now() - 3600000).toISOString(),
    },
]

const delay = (ms: number = 600) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockLogin = async (data: LoginRequest): Promise<LoginResponse> => {
    await delay()

    const usuario = MOCK_USUARIOS.find((u) => u.correo === data.correo)

    if (!usuario) {
        throw Object.assign(new Error('Usuario no autorizado o no registrado.'), { status: 404 })
    }

    if (usuario.estado === EstadoUsuario.Inactivo) {
        throw Object.assign(new Error('Usuario deshabilitado. Contacte al administrador.'), { status: 403 })
    }

    if (usuario.estado === EstadoUsuario.Pendiente) {
        throw Object.assign(new Error('Cuenta pendiente de activación.'), { status: 403 })
    }

    const passwordsValidas: Record<string, string> = {
        'admin@bioactiva.pe': 'admin123!',
        'maria@bioactiva.pe': 'trabajador123!',
    }

    if (passwordsValidas[data.correo] !== data.password) {
        throw Object.assign(new Error('Correo o contraseña incorrectos.'), { status: 401 })
    }

    const accessToken = `mock-jwt-token-${usuario.id}-${Date.now()}`

    useAuthStore.getState().setSession(`mock-jwt-token-${usuario.id}-${Date.now()}`, usuario)

    return { accessToken, accessTokenExpiresIn: 900 }
}

function ofuscarCorreo(correo: string): string {
    const [local, domain] = correo.split('@')
    let ofuscado: string
    if (local.length <= 2) {
        ofuscado = local[0] + '*'
    } else {
        ofuscado = local[0] + '*'.repeat(local.length - 2) + local.at(-1)
    }
    return `${ofuscado}@${domain}`
}

export const mockForgotPassword = async (_correo: string): Promise<ForgotPasswordResponse> => {
    await delay()
    return { ok: true }
}

export const mockValidateToken = async (token: string): Promise<ValidateTokenResponse> => {
    await delay(400)

    const mockToken = MOCK_TOKENS.find((t) => t.token === token)

    if (!mockToken || mockToken.estado === EstadoToken.Consumido) {
        throw Object.assign(new Error('Token de restablecimiento de contraseña inválido o ya utilizado.'), { status: 400 })
    }

    const ahora = new Date()
    const expiracion = new Date(mockToken.expires_at)
    if (ahora > expiracion || mockToken.estado === EstadoToken.Expirado) {
        throw Object.assign(new Error('El token de restablecimiento de contraseña ha expirado.'), { status: 400 })
    }

    return { valid: true, correo: ofuscarCorreo(mockToken.correo) }
}

export const mockResetPassword = async (token: string, _password: string): Promise<ResetPasswordResponse> => {
    await delay()

    const mockToken = MOCK_TOKENS.find((t) => t.token === token)

    if (mockToken?.estado !== EstadoToken.Pendiente) {
        throw Object.assign(new Error('Token de restablecimiento de contraseña inválido o ya utilizado.'), { status: 400 })
    }

    mockToken.estado = EstadoToken.Consumido
    return { ok: true }
}

