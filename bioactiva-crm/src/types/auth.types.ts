import { RolUsuario, EstadoUsuario, TokenPurpose, EstadoToken } from "./enums"

//Usuario Autenticado 
export interface Usuario {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: RolUsuario
    estado: EstadoUsuario
    created_at: string
    updated_at: string
}

// Respuesta en /auth/me backend
export interface UsuarioRaw {
    id: number
    nombres: string
    apellidos: string
    correo: string
    password: string
    role: number
    estado: number
    created_at: string
    updated_at: string
}

// Respuesta de GET/PATCH /profile (UserResponseDto, Mantis #333).
// A diferencia de /auth/me, aquí `rol` y `estado` llegan como strings
// legibles y la fecha de alta como `fechaRegistro` (ISO 8601).
export interface UserResponseDto {
    id: number
    nombres: string
    apellidos: string
    correo: string
    rol: 'ADMINISTRADOR' | 'TRABAJADOR'
    estado: 'ACTIVO' | 'PENDIENTE' | string
    fechaRegistro: string
}

// PATCH /profile — al menos uno de los dos; 1–90 chars. El correo NO es editable.
export interface UpdateProfileRequest {
    nombres?: string
    apellidos?: string
}

// PATCH /profile/password — newPassword 8–72 chars.
export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}

export interface JwtPayload {
    sub: number
    correo: string
    rol: RolUsuario
    iat: number
    exp: number
}

export interface AuthState {
    usuario: Usuario | null
    accessToken: string | null
    tokenExpiresAt: number | null
    isAuthenticated: boolean
    isLoading: boolean
}

export interface LoginRequest {
    correo: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    accessTokenExpiresIn: number
}

export interface RefreshResponse {
    accessToken: string
    accessTokenExpiresIn: number
}

export interface ForgotPasswordRequest {
    correo: string
}

export interface ForgotPasswordResponse {
    ok: boolean
}

export interface ResetPasswordRequest {
    token: string
    password: string
    confirmPassword: string
}

export interface ResetPasswordResponse {
    ok: boolean
}

export interface ValidateTokenResult {
    valid: boolean
    correo?: string
    message?: string
}


export interface UserToken {
    id: number
    correo: string
    token_hash: string
    proposito: TokenPurpose
    id_usuario: number
    rol: RolUsuario
    estado: EstadoToken
    expires_at: string
    consumed_at: string | null
    created_at: string
}

export interface ValidateTokenResponse {
    valid: boolean
    correo?: string
    message?: string
}

