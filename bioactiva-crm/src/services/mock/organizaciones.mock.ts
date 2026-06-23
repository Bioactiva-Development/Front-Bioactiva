import { TipoEmpresa, TamanoEmpresa, Sector } from '@/types';
import{
    Organizacion,
    OrganizacionFiltros,
    OrganizacionesResponse,
    SunatRucResult,
    SunatNombreResult,
    ContactoResumido,
    LeadResumido,
    CotizacionResumida,
    OrganizacionConRelaciones,
} from '@/types/organizacion.types';
import { MOCK_CONTACTOS as MOCK_CONTACTOS_LIST } from './contactos.mock';



const MOCK_ORGANIZACIONES: Organizacion[] = [
    {
        id: 'org-001',
        codigo_cliente: 'ORG-2026-001',
        nombre: 'Altomayo',
        nombre_comercial: 'Altomayo',
        ruc: '20601258529',
        tipo: TipoEmpresa.EmpresaNacional,
        sector: Sector.AGROALIMENTARIA,
        tamano: TamanoEmpresa.Grande,
        ubicacion: 'Lima, Peru',
        actividad_economica: 'Fabricación de productos de café',
        id_author: 1,
        created_at: '2025-01-01T08:00:00Z',
        updated_at: '2025-01-01T08:00:00Z',
    },

    {
        id: 'org-002',
        codigo_cliente: 'ORG-2026-002',
        nombre: 'Cacao de Aroma',
        nombre_comercial: 'Cacao de Aroma',
        sub_area: 'Área de Innovación y Proyectos',
        ruc: '20524967627',
        tipo: TipoEmpresa.EmpresaNacional,
        sector: Sector.AGROALIMENTARIA,
        tamano: TamanoEmpresa.Mediana,
        ubicacion: 'San Martín, Peru',
        actividad_economica: 'Producción de cacao fino de aroma',
        id_author: 1,
        created_at: '2025-01-05T08:00:00Z',
        updated_at: '2025-01-05T08:00:00Z',
    },

    {
      id: 'org-003',
      codigo_cliente: 'ORG-2026-003',
      nombre: 'Municipalidad de Miraflores',
      nombre_comercial: 'Municipalidad de Miraflores',
      sub_area: 'Gerencia de Desarrollo Económico',
      ruc: '20524967628',
      tipo: TipoEmpresa.GobiernoNacional,
      sector:  Sector.OTROS,
      tamano: TamanoEmpresa.Grande,
      ubicacion: 'Lima, Peru',
      id_author: 1,
      created_at: '2025-01-10T08:00:00Z',
      updated_at: '2025-01-10T08:00:00Z',
    },

    {
      id: 'org-004',
      codigo_cliente: 'ORG-2026-004',
      nombre: 'AgroTech Innova',
      nombre_comercial: 'AgroTech Innova',
      tipo: TipoEmpresa.EmpresaNacional,
      sector: Sector.TECNOLOGIA,
      tamano: TamanoEmpresa.Micro,
      ubicacion: 'Arequipa, Peru',
      actividad_economica: 'Tecnología agrícola',
      id_author: 2,
      created_at: '2025-02-01T08:00:00Z',
      updated_at: '2025-02-01T08:00:00Z',
    },
    {
      id: 'org-005',
      codigo_cliente: 'ORG-2026-005',
      nombre: 'Inversiones Pisco S.A.',
      nombre_comercial: 'Inversiones Pisco',
      tipo: TipoEmpresa.EmpresaNacional,
      sector: Sector.MANUFACTURA,
      tamano: TamanoEmpresa.Mediana,
      ubicacion: 'Ica, Peru',
      actividad_economica: 'Alimentos y Bebidas',
      id_author: 2,
      created_at: '2025-02-10T08:00:00Z',
      updated_at: '2025-02-10T08:00:00Z',
    },
    {
      id: 'org-006',
      codigo_cliente: 'ORG-2026-006',
      nombre: 'Constructora del Sur',
      nombre_comercial: 'Constructora del Sur',
      tipo: TipoEmpresa.EmpresaNacional,
      sector: Sector.OTROS,
      tamano: TamanoEmpresa.Grande,
      ubicacion: 'Cusco, Peru',
      actividad_economica: 'Construcción',
      id_author: 1,
      created_at: '2025-03-01T08:00:00Z',
      updated_at: '2025-03-01T08:00:00Z',
    },    
]



const MOCK_LEADS_POR_ORG: Record<string, LeadResumido[]> = {
  'org-001': [
    {
      id:               1,
      servicio_interes: 'Diagnóstico de innovación y hoja de ruta tecnológica',
      estado:           'Ofertado',
      created_at:       '2025-04-03T08:00:00Z',
      encargado:        'Administración',
    },
  ],
  'org-002': [
    {
      id:               2,
      servicio_interes: 'Formulación de proyecto I+D',
      estado:           'En prospecto',
      created_at:       '2025-03-15T08:00:00Z',
      encargado:        'María Torres',
    },
  ],
}

const MOCK_COTIZACIONES_POR_ORG: Record<string, CotizacionResumida[]> = {
  'org-001': [
    {
      id:               1,
      nombre_servicio:  'Diagnóstico de capacidades tecnológicas y hoja de ruta de innovación para línea café specialty',
      monto:            6500,
      tipo:             'PEN',
      estado:           'Aceptada',
      fecha_cot:        '2025-03-11T08:00:00Z',
      dirigido:         'Patricia Ccopa Mamani',
      nombre_remitente: 'Administración',
      observacion:      'Incluye dos visitas técnicas a planta y entrega de informe con roadmap de innovación.',
      id_lead:          1,
      codigo_lead:      'LEAD-2025-008',
    },
  ],
}



const delay = (ms: number = 600) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetOrganizaciones = async (
  filtros?: OrganizacionFiltros
): Promise<OrganizacionesResponse> => {
  await delay()

  let resultado = [...MOCK_ORGANIZACIONES]

  if (filtros?.search) {
    const q = filtros.search.toLowerCase()
    resultado = resultado.filter(
      (o) =>
        o.nombre.toLowerCase().includes(q) ||
        o.nombre_comercial.toLowerCase().includes(q)
    )
  }

  if (filtros?.sector) {
    resultado = resultado.filter((o) => o.sector === filtros.sector)
  }

  if (filtros?.tamano) {
    resultado = resultado.filter((o) => o.tamano === filtros.tamano)
  }

  if (filtros?.tipo) {
    resultado = resultado.filter((o) => o.tipo === filtros.tipo)
  }

  const page  = filtros?.page  ?? 1
  const limit = filtros?.limit ?? 10
  const start = (page - 1) * limit
  const data  = resultado.slice(start, start + limit)

  return {
    data,
    total: resultado.length,
    page,
    limit,
  }
}

export const mockGetOrganizacion = async (
  id: string
): Promise<Organizacion> => {
  await delay(400)

  const org = MOCK_ORGANIZACIONES.find((o) => o.id === id)
  if (!org) {
    throw Object.assign(new Error('Organización no encontrada.'), { status: 404 })
  }
  return org
}

export const mockCreateOrganizacion = async (
  data: Partial<Organizacion>
): Promise<Organizacion> => {
  await delay()

  const nueva: Organizacion = {
    id:              `org-${Date.now()}`,
    codigo_cliente:  data.codigo_cliente ?? `ORG-2026-${MOCK_ORGANIZACIONES.length + 1}`,
    nombre:          data.nombre!,
    nombre_comercial: data.nombre_comercial!,
    sub_area:        data.sub_area,
    ruc:             data.ruc,
    tipo:            data.tipo!,
    sector:          data.sector!,
    tamano:          data.tamano!,
    ubicacion:       data.ubicacion,
    actividad_economica:   data.actividad_economica,
    alianzas_estrategicas: data.alianzas_estrategicas,
    linkedin:        data.linkedin,
    id_author:       1,
    created_at:      new Date().toISOString(),
    updated_at:      new Date().toISOString(),
  }


  const existe = MOCK_ORGANIZACIONES.find(
    (o) => o.nombre.toLowerCase() === nueva.nombre.toLowerCase()
  )
  if (existe) {
    throw Object.assign(new Error('La organización ya se encuentra registrada.'), { status: 409 })
  }


  if (nueva.ruc) {
    const existeRuc = MOCK_ORGANIZACIONES.find((o) => o.ruc === nueva.ruc)
    if (existeRuc) {
      throw Object.assign(new Error('El RUC ya se encuentra registrado.'), { status: 409 })
    }
  }


  if (nueva.codigo_cliente) {
    const existeCodigo = MOCK_ORGANIZACIONES.find(
      (o) => o.codigo_cliente === nueva.codigo_cliente
    )
    if (existeCodigo) {
      throw Object.assign(new Error('El código interno ya se encuentra registrado.'), { status: 409 })
    }
  }

  MOCK_ORGANIZACIONES.push(nueva)
  return nueva
}

export const mockUpdateOrganizacion = async (
  id: string,
  data: Partial<Organizacion>
): Promise<Organizacion> => {
  await delay()

  const index = MOCK_ORGANIZACIONES.findIndex((o) => o.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Organización no encontrada.'), { status: 404 })
  }


  if (data.nombre) {
    const existe = MOCK_ORGANIZACIONES.find(
      (o) => o.nombre.toLowerCase() === data.nombre!.toLowerCase() && o.id !== id
    )
    if (existe) {
      throw Object.assign(new Error('La organización ya se encuentra registrada.'), { status: 409 })
    }
  }

  const actualizada = {
    ...MOCK_ORGANIZACIONES[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_ORGANIZACIONES[index] = actualizada
  return actualizada
}


export const mockDeleteOrganizacion = async (id: string): Promise<void> => {
  await delay()

  const index = MOCK_ORGANIZACIONES.findIndex((o) => o.id === id)
  if (index === -1) {
    throw Object.assign(new Error('Organización no encontrada.'), { status: 404 })
  }
  MOCK_ORGANIZACIONES.splice(index, 1)
}

export const mockSunatPorRuc = async (
  ruc: string
): Promise<SunatRucResult> => {
  await delay(800)


  const MOCK_SUNAT: Record<string, SunatRucResult> = {
    '20601258529': {
      ruc:         '20601258529',
      nombre:      'ALTOMAYO PERU S.A.C.',
      ubicacion:   'AV. REPUBLICA DE PANAMA NRO. 3565 LIMA - LIMA - SAN ISIDRO',
      estado:      'ACTIVO',
      condicion:   'HABIDO',
      actividades: 'ELABORACION DE CAFE',
    },
    '20524967627': {
      ruc:         '20524967627',
      nombre:      'CACAO DE AROMA S.A.C.',
      ubicacion:   'JR. TARAPOTO NRO. 123 SAN MARTIN - TARAPOTO',
      estado:      'ACTIVO',
      condicion:   'HABIDO',
      actividades: 'CULTIVO DE CACAO',
    },
    '20100055237': {
      ruc:         '20100055237',
      nombre:      'SOCIEDAD MINERA CERRO VERDE S.A.A.',
      ubicacion:   'AV. VICTOR ANDRES BELAUNDE NRO. 171 INT. 801 LIMA - LIMA - SAN ISIDRO',
      estado:      'ACTIVO',
      condicion:   'HABIDO',
      actividades: 'EXTRACCION DE MINERALES METALICOS',
    },
    '20100190797': {
      ruc:         '20100190797',
      nombre:      'BANCO DE CREDITO DEL PERU',
      ubicacion:   'CALLE CENTENARIO NRO. 156 LA LIBERTAD - TRUJILLO',
      estado:      'ACTIVO',
      condicion:   'HABIDO',
      actividades: 'ACTIVIDADES DE BANCOS',
    },
    '20512345678': {
      ruc:         '20512345678',
      nombre:      'INNOVACIONES TECNOLOGICAS DEL PERU S.A.C.',
      ubicacion:   'AV. JAVIER PRADO ESTE NRO. 4200 LIMA - LIMA - SANTIAGO DE SURCO',
      estado:      'ACTIVO',
      condicion:   'HABIDO',
      actividades: 'DESARROLLO DE SOFTWARE',
    },
  }

  const resultado = MOCK_SUNAT[ruc]
  if (!resultado) {
    throw Object.assign(new Error('No se encontraron resultados en SUNAT para el RUC consultado.'), { status: 404 })
  }

  return resultado
}


export const mockSunatPorNombre = async (
  nombre: string
): Promise<SunatNombreResult[]> => {
  await delay(1000)

  const MOCK_RESULTADOS: SunatNombreResult[] = [
    { ruc: '20601258529', nombre: 'ALTOMAYO PERU S.A.C.',           ubicacion: 'LIMA',        estado: 'ACTIVO' },
    { ruc: '20524967627', nombre: 'CACAO DE AROMA S.A.C.',          ubicacion: 'SAN MARTIN',  estado: 'ACTIVO' },
    { ruc: '20100055237', nombre: 'SOCIEDAD MINERA CERRO VERDE S.A.A.', ubicacion: 'LIMA',    estado: 'ACTIVO' },
    { ruc: '20100190797', nombre: 'BANCO DE CREDITO DEL PERU',      ubicacion: 'TRUJILLO',    estado: 'ACTIVO' },
    { ruc: '20512345678', nombre: 'INNOVACIONES TECNOLOGICAS DEL PERU S.A.C.', ubicacion: 'LIMA', estado: 'ACTIVO' },
    { ruc: '20100070970', nombre: 'ALICORP S.A.A.',                 ubicacion: 'LIMA',        estado: 'ACTIVO' },
    { ruc: '20131312955', nombre: 'BACKUS Y JOHNSTON S.A.A.',       ubicacion: 'LIMA',        estado: 'ACTIVO' },
  ]

  const q = nombre.toLowerCase()
  return MOCK_RESULTADOS.filter((r) =>
    r.nombre.toLowerCase().includes(q)
  )
}


export const mockGetOrganizacionConRelaciones = async (
  id: string
): Promise<OrganizacionConRelaciones> => {
  await delay(500)

  const org = MOCK_ORGANIZACIONES.find((o) => o.id === id)
  if (!org) {
    throw Object.assign(new Error('Organización no encontrada.'), { status: 404 })
  }

  const todosContactos: ContactoResumido[] = MOCK_CONTACTOS_LIST
    .filter((c) => c.idOrganizacion === id)
    .map((c) => ({
      id:       c.id,
      nombres:  c.nombres,
      apellidos: c.apellidos ?? '',
      vocativo:  c.vocativo,
      cargo:     c.cargo    ?? undefined,
      correo:    c.correo,
      telefono:  c.telefono ?? undefined,
    }))
  return {
    ...org,
    contactos:      todosContactos.slice(0, 6),
    totalContactos: todosContactos.length,
    leads:          MOCK_LEADS_POR_ORG[id]        ?? [],
    cotizaciones:   MOCK_COTIZACIONES_POR_ORG[id] ?? [],
  }
}