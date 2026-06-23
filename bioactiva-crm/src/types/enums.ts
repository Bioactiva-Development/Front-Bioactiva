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
    Pendiente  = 'Pendiente',
    Completada = 'Completada',
    Cancelada  = 'Cancelada',
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
    Academia = 'Academia',
    EmpresaInternacional = 'Empresa internacional',
    EmpresaNacional = 'Empresa nacional',
    GobiernoNacional = 'Gobierno nacional',
    Independiente = 'Independiente',
    ONG = 'ONG',
    OrganismoInternacional = 'Organismo internacional',
}

export enum TamanoEmpresa {
    Micro = 'Micro',
    Pequeno = 'Pequeno',
    Mediano = 'Mediano',
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
    ACUICULTURA = 'ACUICULTURA',
    ADMINISTRACION_PUBLICA = 'ADMINISTRACION_PUBLICA',
    AGRICOLA = 'AGRICOLA',
    AGROALIMENTARIA = 'AGROALIMENTARIA',
    AGROPECUARIO = 'AGROPECUARIO',
    ALIMENTARIA = 'ALIMENTARIA',
    ASESORIA = 'ASESORIA',
    BANCA_Y_SEGUROS = 'BANCA_Y_SEGUROS',
    CONSTRUCCION = 'CONSTRUCCION',
    CONSULTORIA = 'CONSULTORIA',
    COOPERACION_TECNICA = 'COOPERACION_TECNICA',
    EDUCACION = 'EDUCACION',
    ENERGIA = 'ENERGIA',
    FERRETERIA = 'FERRETERIA',
    FINANZAS = 'FINANZAS',
    FORESTAL = 'FORESTAL',
    GANADERIA = 'GANADERIA',
    INFORMATICA = 'INFORMATICA',
    MANUFACTURA = 'MANUFACTURA',
    MINERIA = 'MINERIA',
    OTROS = 'OTROS',
    PESCA = 'PESCA',
    SALUD = 'SALUD',
    TECNOLOGIA = 'TECNOLOGIA',
    TEXTIL = 'TEXTIL',
    TRANSFORMACION = 'TRANSFORMACION',
    TURISMO = 'TURISMO',
}

export enum EstadoToken {
    Pendiente = 'Pendiente',
    Consumido = 'Consumido',
    Expirado = 'Expirado',
    Revocado = 'Revocado',
}