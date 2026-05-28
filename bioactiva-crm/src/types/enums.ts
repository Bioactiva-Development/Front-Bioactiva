export enum RolUsuario {
    Administrador = 'Administrador',
    Trabajador = 'Trabajador',
}

export enum EstadoUsuario {
    Pendiente = 'Pendiente',
    Activo = 'Activo',
    Inactivo = 'Inactivo',
}

export enum LeadState {
    Prospecto = 'En prospecto',
    Ofertado = 'Ofertado',
    CierreVenta = 'Cierre con venta',
    CierreSinVenta = 'Cierre sin venta',
}

export enum TipoActividad {
    Email = 'Email',
    Reunion = 'Reunion',
    Llamada = 'Llamada',
    Otro = 'Otro',
}

export enum EstadoActividad {
    Pendiente = 'Pendiente',
    Completada = 'Completada',
}

export enum EstadoCot {
    Pendiente = 'Pendiente',
    Enviada = 'Enviada',
    Aceptada = 'Aceptada',
    Rechazada = 'Rechazada',
}

export enum TipoMoneda {
    Soles = 'PEN',
    Dolares = 'USD',
}

export enum TipoEmpresa {
    Privada = 'Privada',
    Publica = 'Publica',
    ONG = 'ONG',
    Mixta = 'Mixta',
}

export enum TamanoEmpresa {
    Micro = 'Micro',
    Pequena = 'Pequena',
    Mediana = 'Mediana',
    Grande = 'Grande',
}

export enum EstadoNotif {
    NoLeida = 'No Leida',
    Leida = 'Leida',
}

export enum TokenPurpose {
    Activacion = 'Activacion',
    Recuperacion = 'Recuperacion',
}

export enum EstadoSecuencia {
    Programada = 'Programada',
    EnEjecucion = 'EnEjecucion',
    Completada = 'Completada',
    Cancelada = 'Cancelada',
}

export enum Vocativo {
    SR = 'SR',
    SRA = 'SRA',
    SRTA = 'SRTA',
}

export enum Sector {
    Agroindustria = 'Agroindustria',
    Manufactura = 'Manufactura',
    Tecnologia = 'Tecnologia',
    Salud = 'Salud',
    Educacion = 'Educacion',
    OtroSector = 'Otro',
}

export enum EstadoToken {
    Pendiente = 'Pendiente',
    Consumido = 'Consumido',
    Expirado = 'Expirado',
}