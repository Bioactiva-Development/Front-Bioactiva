import { Vocativo } from '@/types/enums'
import {
    Contacto,
    ContactoFiltros,
    ContactosResponse,
} from '@/types/contacto.types'

const MOCK_CONTACTOS: Contacto[] = [
    {
        id:                  1,
        nombres:             'Ricardo',
        apellidos:           'Perales Tuesta',
        vocativo:            Vocativo.SR,
        cargo:               'Gerente de Proyectos',
        correo:              'rperales@altomayo.com.pe',
        telefono:            '997 654 321',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-01T08:00:00Z',
        updatedAt:           '2025-01-01T08:00:00Z',
    },
    {
        id:                  2,
        nombres:             'Lucía',
        apellidos:           'Huanca Ríos',
        vocativo:            Vocativo.SRA,
        cargo:               'Jefa de Innovación',
        correo:              'lhuanca@altomayo.com.pe',
        telefono:            '991 234 567',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-02T08:00:00Z',
        updatedAt:           '2025-01-02T08:00:00Z',
    },
    {
        id:                  3,
        nombres:             'Héctor',
        apellidos:           'Sánchez Ruiz',
        vocativo:            Vocativo.SR,
        cargo:               'Gerente Comercial',
        correo:              'hsanchez@altomayo.com.pe',
        telefono:            '993 111 456',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-03T08:00:00Z',
        updatedAt:           '2025-01-03T08:00:00Z',
    },
    {
        id:                  4,
        nombres:             'Patricia',
        apellidos:           'Ccopa Mamani',
        vocativo:            Vocativo.SRA,
        cargo:               'Gerente de Operaciones',
        correo:              'pccopa@altomayo.com.pe',
        telefono:            '945 887 234',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-04T08:00:00Z',
        updatedAt:           '2025-01-04T08:00:00Z',
    },
    {
        id:                  5,
        nombres:             'Javier',
        apellidos:           'Medina Tapia',
        vocativo:            Vocativo.SR,
        cargo:               'Jefe de Calidad',
        correo:              'jmedina@altomayo.com.pe',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-05T08:00:00Z',
        updatedAt:           '2025-01-05T08:00:00Z',
    },
    {
        id:                  6,
        nombres:             'Valeria',
        apellidos:           'Torres Aquino',
        vocativo:            Vocativo.SRA,
        cargo:               'Coordinadora de Proyectos I+D',
        correo:              'vtorres@altomayo.com.pe',
        telefono:            '998 302 177',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-06T08:00:00Z',
        updatedAt:           '2025-01-06T08:00:00Z',
    },
    {
        id:                  7,
        nombres:             'Ernesto',
        apellidos:           'Villanueva Ríos',
        vocativo:            Vocativo.SR,
        cargo:               'Subgerente de Finanzas',
        correo:              'evillanueva@altomayo.com.pe',
        telefono:            '944 560 012',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-07T08:00:00Z',
        updatedAt:           '2025-01-07T08:00:00Z',
    },
    {
        id:                  8,
        nombres:             'Carmen',
        apellidos:           'Delgado Ponce',
        vocativo:            Vocativo.SRA,
        cargo:               'Asistente de Gerencia',
        correo:              'cdelgado@altomayo.com.pe',
        idOrganizacion:      'org-001',
        organizacion_nombre: 'Altomayo',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-08T08:00:00Z',
        updatedAt:           '2025-01-08T08:00:00Z',
    },
    {
        id:                  9,
        nombres:             'Carlos',
        apellidos:           'Vargas Díaz',
        vocativo:            Vocativo.SR,
        cargo:               'Director Ejecutivo',
        correo:              'cvargas@cacaodearoma.pe',
        telefono:            '942 111 222',
        idOrganizacion:      'org-002',
        organizacion_nombre: 'Cacao de Aroma',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-09T08:00:00Z',
        updatedAt:           '2025-01-09T08:00:00Z',
    },
    {
        id:                  10,
        nombres:             'Milagros',
        apellidos:           'Panduro Reátegui',
        vocativo:            Vocativo.SRA,
        cargo:               'Responsable de Exportaciones',
        correo:              'mpanduro@cacaodearoma.pe',
        telefono:            '965 432 100',
        idOrganizacion:      'org-002',
        organizacion_nombre: 'Cacao de Aroma',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-10T08:00:00Z',
        updatedAt:           '2025-01-10T08:00:00Z',
    },
    {
        id:                  11,
        nombres:             'Fernando',
        apellidos:           'Castro Rojas',
        vocativo:            Vocativo.SR,
        cargo:               'Director General',
        correo:              'fcastro@cacaodearoma.pe',
        telefono:            '965 432 109',
        idOrganizacion:      'org-002',
        organizacion_nombre: 'Cacao de Aroma',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-11T08:00:00Z',
        updatedAt:           '2025-01-11T08:00:00Z',
    },
    {
        id:                  12,
        nombres:             'Ana',
        apellidos:           'Quispe Mamani',
        vocativo:            Vocativo.SRA,
        cargo:               'Jefa de Proyectos',
        correo:              'aquispe@cacaodearoma.pe',
        telefono:            '954 321 098',
        idOrganizacion:      'org-002',
        organizacion_nombre: 'Cacao de Aroma',
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-01-12T08:00:00Z',
        updatedAt:           '2025-01-12T08:00:00Z',
    },
    {
        id:                  13,
        nombres:             'Jorge',
        apellidos:           'Mamani Quispe',
        vocativo:            Vocativo.SR,
        cargo:               'Gerente Municipal',
        correo:              'jmamani@miraflores.gob.pe',
        telefono:            '987 123 456',
        idOrganizacion:      'org-003',
        organizacion_nombre: 'Municipalidad de Miraflores',
        idAuthor:            2,
        estado_correo:       'VIGENTE',
        createdAt:           '2025-02-01T08:00:00Z',
        updatedAt:           '2025-02-01T08:00:00Z',
    },
]

const delay = (ms: number = 600) =>
    new Promise((resolve) => setTimeout(resolve, ms))

export const mockGetContactos = async (
    filtros?: ContactoFiltros
): Promise<ContactosResponse> => {
    await delay()

    let resultado = [...MOCK_CONTACTOS]

    if (filtros?.search) {
        const q = filtros.search.toLowerCase()
        resultado = resultado.filter(
            (c) =>
                c.nombres.toLowerCase().includes(q) ||
                (c.apellidos ?? '').toLowerCase().includes(q) ||
                c.correo.toLowerCase().includes(q) ||
                c.cargo?.toLowerCase().includes(q) ||
                c.organizacion_nombre?.toLowerCase().includes(q)
        )
    }

    if (filtros?.idOrganizacion) {
        resultado = resultado.filter(
            (c) => c.idOrganizacion === filtros.idOrganizacion
        )
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

export const mockGetContacto = async (id: number): Promise<Contacto> => {
    await delay(400)

    const contacto = MOCK_CONTACTOS.find((c) => c.id === id)
    if (!contacto) {
        throw { status: 404, message: 'Contacto no encontrado.' }
    }
    return contacto
}

export const mockCreateContacto = async (
    data: Partial<Contacto>
): Promise<Contacto> => {
    await delay()

    const existe = MOCK_CONTACTOS.find((c) => c.correo === data.correo)
    if (existe) {
        throw { status: 409, message: 'El correo ya se encuentra registrado.' }
    }

    if (data.correo2) {
        const existe2 = MOCK_CONTACTOS.find(
            (c) => c.correo === data.correo2 || c.correo2 === data.correo2
        )
        if (existe2) {
            throw { status: 409, message: 'El correo secundario ya se encuentra registrado.' }
        }
    }

    const nuevo: Contacto = {
        id:                  Date.now(),
        nombres:             data.nombres!,
        apellidos:           data.apellidos ?? null,
        vocativo:            data.vocativo,
        cargo:               data.cargo,
        correo:              data.correo!,
        correo2:             data.correo2,
        telefono:            data.telefono,
        comentarios:         data.comentarios,
        idOrganizacion:      data.idOrganizacion!,
        organizacion_nombre: data.organizacion_nombre,
        idAuthor:            1,
        estado_correo:       'VIGENTE',
        createdAt:           new Date().toISOString(),
        updatedAt:           new Date().toISOString(),
    }

    MOCK_CONTACTOS.push(nuevo)
    return nuevo
}

export const mockUpdateContacto = async (
    id: number,
    data: Partial<Contacto>
): Promise<Contacto> => {
    await delay()

    const index = MOCK_CONTACTOS.findIndex((c) => c.id === id)
    if (index === -1) {
        throw { status: 404, message: 'Contacto no encontrado.' }
    }

    if (data.correo) {
        const existe = MOCK_CONTACTOS.find(
            (c) => c.correo === data.correo && c.id !== id
        )
        if (existe) {
            throw { status: 409, message: 'El correo ya se encuentra registrado.' }
        }
    }

    const actualizado: Contacto = {
        ...MOCK_CONTACTOS[index],
        ...data,
        updatedAt: new Date().toISOString(),
    }

    MOCK_CONTACTOS[index] = actualizado
    return actualizado
}
