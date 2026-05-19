import { RolUsuario, EstadoUsuario, TokenPurpose, EstadoToken } from '@/types/enums'
import {
    LoginRequest, LoginResponse, ForgotPasswordResponse, ResetPasswordResponse,
    ActivateAccountRequest, ActivateAccountResponse, ValidateTokenResponse, Usuario,
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
        throw { status: 404, message: 'Usuario no autorizado o no registrado.' }
    }

    if (usuario.estado === EstadoUsuario.Inactivo) {
        throw { status: 403, message: 'Usuario deshabilitado. Contacte al administrador.' }
    }

    if (usuario.estado === EstadoUsuario.Pendiente) {
        throw { status: 403, message: 'Cuenta pendiente de activación.' }
    }

    const passwordsValidas: Record<string, string> = {
        'admin@bioactiva.pe': 'admin123!',
        'maria@bioactiva.pe': 'trabajador123!',
    }

    if (passwordsValidas[data.correo] !== data.password) {
        throw { status: 401, message: 'Correo o contraseña incorrectos.' }
    }

    const accessToken = `mock-jwt-token-${usuario.id}-${Date.now()}`

    useAuthStore.getState().setSession(`mock-jwt-token-${usuario.id}-${Date.now()}`, usuario)

    return { accessToken, accessTokenExpiresIn: 900 }
}

export const mockForgotPassword = async (correo: string): Promise<ForgotPasswordResponse> => {
    await delay()

    const usuario = MOCK_USUARIOS.find((u) => u.correo === correo)

    if (!usuario) {
        throw { status: 404, message: 'El correo ingresado no se encuentra registrado.' }
    }
    return { message: 'Correo de recuperación enviado correctamente.' }
}

export const mockValidateToken = async (token: string): Promise<ValidateTokenResponse> => {
    await delay(400)

    const mockToken = MOCK_TOKENS.find((t) => t.token === token)

    if (!mockToken) {
        return { valid: false, message: 'El enlace no es válido.' }
    }

    const ahora = new Date()
    const expiracion = new Date(mockToken.expires_at)
    if (ahora > expiracion || mockToken.estado === EstadoToken.Expirado) {
        return { valid: false, message: 'El enlace de recuperación ha expirado.' }
    }

    if (mockToken.estado === EstadoToken.Consumido) {
        return { valid: false, message: 'Este enlace ya fue utilizado.' }
    }
    return {
        valid: true,
        correo: mockToken.correo,
    }
}

export const mockResetPassword = async (token: string, _password: string): Promise<ResetPasswordResponse> => {
    await delay()

    const mockToken = MOCK_TOKENS.find((t) => t.token === token)

    if (!mockToken || mockToken.estado !== EstadoToken.Pendiente) {
        throw { status: 400, message: 'El enlace no es válido o ya fue utilizado.' }
    }

    mockToken.estado = EstadoToken.Consumido
    return { message: 'Contraseña actualizada correctamente.' }
}

export const mockActivateAccount = async (data: ActivateAccountRequest): Promise<ActivateAccountResponse> => {
    await delay()
    const mockToken = MOCK_TOKENS.find((t) => t.token === data.token)

    if (!mockToken || mockToken.estado !== EstadoToken.Pendiente) {
        throw { status: 400, message: 'El enlace de activación no es válido o ya fue utilizado.' }
    }

    const ahora = new Date()
    const expiracion = new Date(mockToken.expires_at)

    if (ahora > expiracion) {
        throw {
            status: 400,
            message: 'El tiempo para definir las credenciales venció. Solicite un nuevo correo.',
        }
    }

    mockToken.estado = EstadoToken.Consumido

    const nuevoUsuario: Usuario = {
        id: Date.now(),
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: mockToken.correo,
        rol: RolUsuario.Trabajador,
        estado: EstadoUsuario.Activo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    return {
        message: 'Cuenta activada correctamente.',
        usuario: nuevoUsuario,
    }
}