import { Sector, TipoEmpresa, TamanoEmpresa, LeadState, EstadoCot, TipoMoneda } from '@/types/enums'
import {
    EntidadExportable,
    ImportPreviewResult,
    ExportarResult,
    ConfirmarImportResult,
    FiltrosExportacion,
    ConteoExportacion,
    FiltrosOrganizacion,
    FiltrosContacto,
    FiltrosLead,
    FiltrosCotizacion,
    RegistroPreview,
} from '@/types/datos.types'

// ─── Datos mock por entidad ────────────────────────────────────────────────

const MOCK_ORG: RegistroPreview[] = [
    { codigo_cliente: 'ORG-001', nombre: 'Tech Solutions SAC', ruc: '20123456789', tipo: TipoEmpresa.Privada, sector: Sector.TECNOLOGIA, tamano: TamanoEmpresa.Mediana, ubicacion: 'Lima', actividad_economica: 'Desarrollo de software' },
    { codigo_cliente: 'ORG-002', nombre: 'Agro Perú EIRL', ruc: '20987654321', tipo: TipoEmpresa.Privada, sector: Sector.AGROALIMENTARIA, tamano: TamanoEmpresa.Pequena, ubicacion: 'Arequipa', actividad_economica: 'Procesamiento de alimentos' },
    { codigo_cliente: 'ORG-003', nombre: 'InnoSalud SA', ruc: '20456789123', tipo: TipoEmpresa.Privada, sector: Sector.SALUD, tamano: TamanoEmpresa.Grande, ubicacion: 'Lima', actividad_economica: 'Servicios de salud' },
    { codigo_cliente: 'ORG-004', nombre: 'EduTech Corp', ruc: '20321654987', tipo: TipoEmpresa.Privada, sector: Sector.EDUCACION, tamano: TamanoEmpresa.Micro, ubicacion: 'Cusco', actividad_economica: 'Educación en línea' },
    { codigo_cliente: 'ORG-005', nombre: 'Manufactura Global SAC', ruc: '20111222333', tipo: TipoEmpresa.Mixta, sector: Sector.MANUFACTURA, tamano: TamanoEmpresa.Grande, ubicacion: 'Callao', actividad_economica: 'Fabricación de piezas industriales' },
    { codigo_cliente: 'ORG-006', nombre: 'ConsultFund ONG', ruc: '', tipo: TipoEmpresa.ONG, sector: Sector.OTROS, tamano: TamanoEmpresa.Pequena, ubicacion: 'Lima', actividad_economica: 'Consultoría sin fines de lucro' },
]
const ORG_COLUMNAS = ['codigo_cliente', 'nombre', 'ruc', 'tipo', 'sector', 'tamano', 'ubicacion', 'actividad_economica']

const MOCK_CONTACTOS: RegistroPreview[] = [
    { nombres: 'Juan Carlos', apellidos: 'García López', cargo: 'Gerente General', correo: 'jgarcia@techsolutions.pe', telefono: '999111222', organizacion: 'Tech Solutions SAC' },
    { nombres: 'María Elena', apellidos: 'Torres Vega', cargo: 'Directora I+D', correo: 'mtorres@agroperu.pe', telefono: '988333444', organizacion: 'Agro Perú EIRL' },
    { nombres: 'Roberto', apellidos: 'Silva Díaz', cargo: 'Jefe de Proyectos', correo: 'rsilva@innosalud.pe', telefono: '977555666', organizacion: 'InnoSalud SA' },
    { nombres: 'Ana Lucía', apellidos: 'Mendoza Castro', cargo: 'CEO', correo: 'amendoza@edutech.pe', telefono: '966777888', organizacion: 'EduTech Corp' },
    { nombres: 'Carlos', apellidos: 'Huanca Quispe', cargo: 'Gerente de Operaciones', correo: 'chuanca@manufactura.pe', telefono: '955999000', organizacion: 'Manufactura Global SAC' },
]
const CONTACTO_COLUMNAS = ['nombres', 'apellidos', 'cargo', 'correo', 'telefono', 'organizacion']

const MOCK_LEADS: RegistroPreview[] = [
    { organizacion: 'Tech Solutions SAC', estado: LeadState.Prospecto, servicio_interes: 'Consultoría I+D', encargado: 'Luis Ramos', canal_captacion: 'LinkedIn' },
    { organizacion: 'Agro Perú EIRL', estado: LeadState.Ofertado, servicio_interes: 'Vigilancia Tecnológica', encargado: 'María López', canal_captacion: 'Referido' },
    { organizacion: 'InnoSalud SA', estado: LeadState.CierreVenta, servicio_interes: 'Propiedad Intelectual', encargado: 'Luis Ramos', canal_captacion: 'Web' },
    { organizacion: 'EduTech Corp', estado: LeadState.Prospecto, servicio_interes: 'Formulación de Proyectos', encargado: 'Ana Pérez', canal_captacion: 'Evento' },
    { organizacion: 'Manufactura Global SAC', estado: LeadState.CierreSinVenta, servicio_interes: 'I+D+i', encargado: 'María López', canal_captacion: 'LinkedIn' },
]
const LEAD_COLUMNAS = ['organizacion', 'estado', 'servicio_interes', 'encargado', 'canal_captacion']

const MOCK_COTIZACIONES: RegistroPreview[] = [
    { cliente: 'Tech Solutions SAC', nombre_servicio: 'Consultoría I+D', monto: 15000, moneda: TipoMoneda.Soles, estado: EstadoCot.Enviada, fecha_cot: '2024-03-01' },
    { cliente: 'Agro Perú EIRL', nombre_servicio: 'Vigilancia Tecnológica', monto: 8500, moneda: TipoMoneda.Soles, estado: EstadoCot.Aceptada, fecha_cot: '2024-02-15' },
    { cliente: 'InnoSalud SA', nombre_servicio: 'Propiedad Intelectual', monto: 22000, moneda: TipoMoneda.Dolares, estado: EstadoCot.Pendiente, fecha_cot: '2024-03-10' },
    { cliente: 'EduTech Corp', nombre_servicio: 'Formulación de Proyectos', monto: 6000, moneda: TipoMoneda.Soles, estado: EstadoCot.Rechazada, fecha_cot: '2024-01-20' },
]
const COT_COLUMNAS = ['cliente', 'nombre_servicio', 'monto', 'moneda', 'estado', 'fecha_cot']

// ─── Filtrado ──────────────────────────────────────────────────────────────

function filtrarOrganizaciones(busqueda: string, f: FiltrosOrganizacion): RegistroPreview[] {
    return MOCK_ORG.filter(org => {
        if (busqueda) {
            const q = busqueda.toLowerCase()
            if (!String(org.nombre).toLowerCase().includes(q) && !String(org.ruc).includes(q)) return false
        }
        if (f.sector && org.sector !== f.sector) return false
        if (f.tipo && org.tipo !== f.tipo) return false
        if (f.tamano && org.tamano !== f.tamano) return false
        return true
    })
}

function filtrarContactos(busqueda: string, f: FiltrosContacto): RegistroPreview[] {
    return MOCK_CONTACTOS.filter(c => {
        if (busqueda) {
            const q = busqueda.toLowerCase()
            const fullName = `${c.nombres} ${c.apellidos}`.toLowerCase()
            if (!fullName.includes(q) && !String(c.correo).toLowerCase().includes(q)) return false
        }
        if (f.organizacion && !String(c.organizacion).toLowerCase().includes(f.organizacion.toLowerCase())) return false
        return true
    })
}

function filtrarLeads(busqueda: string, f: FiltrosLead): RegistroPreview[] {
    return MOCK_LEADS.filter(l => {
        if (busqueda) {
            const q = busqueda.toLowerCase()
            if (!String(l.organizacion).toLowerCase().includes(q) && !String(l.servicio_interes).toLowerCase().includes(q)) return false
        }
        if (f.estado && l.estado !== f.estado) return false
        return true
    })
}

function filtrarCotizaciones(busqueda: string, f: FiltrosCotizacion): RegistroPreview[] {
    return MOCK_COTIZACIONES.filter(c => {
        if (busqueda) {
            const q = busqueda.toLowerCase()
            if (!String(c.cliente).toLowerCase().includes(q) && !String(c.nombre_servicio).toLowerCase().includes(q)) return false
        }
        if (f.estado && c.estado !== f.estado) return false
        return true
    })
}

function filtrarPorEntidad(filtros: FiltrosExportacion): RegistroPreview[] {
    switch (filtros.entidad) {
        case 'organizaciones': return filtrarOrganizaciones(filtros.busqueda, filtros.filtros as FiltrosOrganizacion)
        case 'contactos': return filtrarContactos(filtros.busqueda, filtros.filtros as FiltrosContacto)
        case 'leads': return filtrarLeads(filtros.busqueda, filtros.filtros as FiltrosLead)
        case 'cotizaciones': return filtrarCotizaciones(filtros.busqueda, filtros.filtros as FiltrosCotizacion)
    }
}

function getColumnas(entidad: EntidadExportable): string[] {
    switch (entidad) {
        case 'organizaciones': return ORG_COLUMNAS
        case 'contactos': return CONTACTO_COLUMNAS
        case 'leads': return LEAD_COLUMNAS
        case 'cotizaciones': return COT_COLUMNAS
    }
}

const ETIQUETAS: Record<EntidadExportable, string> = {
    organizaciones: 'organizaciones',
    contactos: 'contactos',
    leads: 'leads',
    cotizaciones: 'cotizaciones',
}

// ─── Exports públicos ──────────────────────────────────────────────────────

export function mockContarExportacion(filtros: FiltrosExportacion): ConteoExportacion {
    const data = filtrarPorEntidad(filtros)
    return { total: data.length, label: ETIQUETAS[filtros.entidad] }
}

export function mockExportar(filtros: FiltrosExportacion): ExportarResult {
    const data = filtrarPorEntidad(filtros)
    const fecha = new Date().toISOString().split('T')[0]
    return {
        data,
        columnas: getColumnas(filtros.entidad),
        filename: `bioactiva_${filtros.entidad}_${fecha}.csv`,
        total: data.length,
    }
}

const MOCK_PREVIEWS: Record<EntidadExportable, ImportPreviewResult> = {
    organizaciones: {
        entidad: 'organizaciones',
        registros: [
            { nombre: 'Nueva Empresa SRL', ruc: '20555666777', tipo: TipoEmpresa.Privada, sector: Sector.TECNOLOGIA, tamano: TamanoEmpresa.Mediana, ubicacion: 'Lima' },
            { nombre: 'Tech Solutions SAC', ruc: '20123456789', tipo: TipoEmpresa.Privada, sector: Sector.TECNOLOGIA, tamano: TamanoEmpresa.Mediana, ubicacion: 'Lima' },
            { nombre: 'Empresa Sin Tipo', ruc: '', tipo: '', sector: Sector.MANUFACTURA, tamano: TamanoEmpresa.Micro, ubicacion: '' },
            { nombre: 'Global Innova SAC', ruc: '20444555666', tipo: TipoEmpresa.Mixta, sector: Sector.OTROS, tamano: TamanoEmpresa.Grande, ubicacion: 'Callao' },
        ],
        conflictos: [
            { fila: 2, campo: 'ruc', valor: '20123456789', mensaje: 'Ya existe una organización con este RUC', tipo: 'duplicado' },
            { fila: 3, campo: 'tipo', valor: '', mensaje: 'El tipo de empresa es obligatorio', tipo: 'error' },
            { fila: 3, campo: 'ruc', valor: '', mensaje: 'RUC vacío: asegúrese de ingresar un código interno', tipo: 'advertencia' },
        ],
        totalFilas: 4,
        filasValidas: 2,
        filasConError: 2,
    },
    contactos: {
        entidad: 'contactos',
        registros: [
            { nombres: 'Pedro', apellidos: 'Gómez Ruiz', cargo: 'Analista', correo: 'pgomez@nueva.pe', telefono: '999000111', organizacion: 'Nueva Empresa SRL' },
            { nombres: 'Lucía', apellidos: 'Vargas', cargo: 'Coordinadora', correo: 'jgarcia@techsolutions.pe', telefono: '988000222', organizacion: 'Tech Solutions SAC' },
            { nombres: 'Marco', apellidos: 'Ríos', cargo: '', correo: 'mrios@example.com', telefono: '', organizacion: '' },
        ],
        conflictos: [
            { fila: 2, campo: 'correo', valor: 'jgarcia@techsolutions.pe', mensaje: 'Este correo ya está registrado', tipo: 'duplicado' },
            { fila: 3, campo: 'organizacion', valor: '', mensaje: 'La organización es obligatoria', tipo: 'error' },
        ],
        totalFilas: 3,
        filasValidas: 1,
        filasConError: 2,
    },
    leads: {
        entidad: 'leads',
        registros: [
            { organizacion: 'Nueva Empresa SRL', estado: LeadState.Prospecto, servicio_interes: 'I+D', encargado: 'Luis Ramos' },
            { organizacion: '', estado: LeadState.Ofertado, servicio_interes: 'Consultoría', encargado: 'Ana Pérez' },
        ],
        conflictos: [
            { fila: 2, campo: 'organizacion', valor: '', mensaje: 'La organización es obligatoria en los leads', tipo: 'error' },
        ],
        totalFilas: 2,
        filasValidas: 1,
        filasConError: 1,
    },
    cotizaciones: {
        entidad: 'cotizaciones',
        registros: [
            { cliente: 'Nueva Empresa SRL', nombre_servicio: 'I+D Aplicado', monto: 12000, moneda: TipoMoneda.Soles, estado: EstadoCot.Pendiente, fecha_cot: '2024-04-01' },
            { cliente: 'Tech Solutions SAC', nombre_servicio: 'Vigilancia', monto: -500, moneda: TipoMoneda.Dolares, estado: EstadoCot.Pendiente, fecha_cot: '2024-04-05' },
        ],
        conflictos: [
            { fila: 2, campo: 'monto', valor: '-500', mensaje: 'El monto debe ser mayor o igual a 0 (RF-0062)', tipo: 'error' },
        ],
        totalFilas: 2,
        filasValidas: 1,
        filasConError: 1,
    },
}

export function mockPreviewImport(entidad: EntidadExportable): ImportPreviewResult {
    return MOCK_PREVIEWS[entidad]
}

export function mockConfirmarImport(entidad: EntidadExportable): ConfirmarImportResult {
    const preview = MOCK_PREVIEWS[entidad]
    return {
        exitosos: preview.filasValidas,
        errores: 0,
        mensaje: `Se importaron ${preview.filasValidas} registros correctamente.`,
    }
}
