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
    vocativo:            Vocativo.Sr,
    cargo:               'Gerente de Proyectos',
    correo:              'rperales@altomayo.com.pe',
    telefono:            '997 654 321',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-01T08:00:00Z',
    updated_at:          '2025-01-01T08:00:00Z',
  },
  {
    id:                  2,
    nombres:             'Lucía',
    apellidos:           'Huanca Ríos',
    vocativo:            Vocativo.Sra,
    cargo:               'Jefa de Innovación',
    correo:              'lhuanca@altomayo.com.pe',
    telefono:            '991 234 567',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-02T08:00:00Z',
    updated_at:          '2025-01-02T08:00:00Z',
  },
  {
    id:                  3,
    nombres:             'Héctor',
    apellidos:           'Sánchez Ruiz',
    vocativo:            Vocativo.Sr,
    cargo:               'Gerente Comercial',
    correo:              'hsanchez@altomayo.com.pe',
    telefono:            '993 111 456',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-03T08:00:00Z',
    updated_at:          '2025-01-03T08:00:00Z',
  },
  {
    id:                  4,
    nombres:             'Patricia',
    apellidos:           'Ccopa Mamani',
    vocativo:            Vocativo.Sra,
    cargo:               'Gerente de Operaciones',
    correo:              'pccopa@altomayo.com.pe',
    telefono:            '945 887 234',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-04T08:00:00Z',
    updated_at:          '2025-01-04T08:00:00Z',
  },
  {
    id:                  5,
    nombres:             'Javier',
    apellidos:           'Medina Tapia',
    vocativo:            Vocativo.Sr,
    cargo:               'Jefe de Calidad',
    correo:              'jmedina@altomayo.com.pe',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-05T08:00:00Z',
    updated_at:          '2025-01-05T08:00:00Z',
  },
  {
    id:                  6,
    nombres:             'Valeria',
    apellidos:           'Torres Aquino',
    vocativo:            Vocativo.Sra,
    cargo:               'Coordinadora de Proyectos I+D',
    correo:              'vtorres@altomayo.com.pe',
    telefono:            '998 302 177',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-06T08:00:00Z',
    updated_at:          '2025-01-06T08:00:00Z',
  },
  {
    id:                  7,
    nombres:             'Ernesto',
    apellidos:           'Villanueva Ríos',
    vocativo:            Vocativo.Sr,
    cargo:               'Subgerente de Finanzas',
    correo:              'evillanueva@altomayo.com.pe',
    telefono:            '944 560 012',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-07T08:00:00Z',
    updated_at:          '2025-01-07T08:00:00Z',
  },
  {
    id:                  8,
    nombres:             'Carmen',
    apellidos:           'Delgado Ponce',
    vocativo:            Vocativo.Sra,
    cargo:               'Asistente de Gerencia',
    correo:              'cdelgado@altomayo.com.pe',
    id_organizacion:     'org-001',
    organizacion_nombre: 'Altomayo',
    id_author:           1,
    created_at:          '2025-01-08T08:00:00Z',
    updated_at:          '2025-01-08T08:00:00Z',
  },
  {
    id:                  9,
    nombres:             'Carlos',
    apellidos:           'Vargas Díaz',
    vocativo:            Vocativo.Sr,
    cargo:               'Director Ejecutivo',
    correo:              'cvargas@cacaodearoma.pe',
    telefono:            '942 111 222',
    id_organizacion:     'org-002',
    organizacion_nombre: 'Cacao de Aroma',
    id_author:           1,
    created_at:          '2025-01-09T08:00:00Z',
    updated_at:          '2025-01-09T08:00:00Z',
  },
  {
    id:                  10,
    nombres:             'Milagros',
    apellidos:           'Panduro Reátegui',
    vocativo:            Vocativo.Sra,
    cargo:               'Responsable de Exportaciones',
    correo:              'mpanduro@cacaodearoma.pe',
    telefono:            '965 432 100',
    id_organizacion:     'org-002',
    organizacion_nombre: 'Cacao de Aroma',
    id_author:           1,
    created_at:          '2025-01-10T08:00:00Z',
    updated_at:          '2025-01-10T08:00:00Z',
  },
  {
    id:                  11,
    nombres:             'Fernando',
    apellidos:           'Castro Rojas',
    vocativo:            Vocativo.Sr,
    cargo:               'Director General',
    correo:              'fcastro@cacaodearoma.pe',
    telefono:            '965 432 109',
    id_organizacion:     'org-002',
    organizacion_nombre: 'Cacao de Aroma',
    id_author:           1,
    created_at:          '2025-01-11T08:00:00Z',
    updated_at:          '2025-01-11T08:00:00Z',
  },
  {
    id:                  12,
    nombres:             'Ana',
    apellidos:           'Quispe Mamani',
    vocativo:            Vocativo.Sra,
    cargo:               'Jefa de Proyectos',
    correo:              'aquispe@cacaodearoma.pe',
    telefono:            '954 321 098',
    id_organizacion:     'org-002',
    organizacion_nombre: 'Cacao de Aroma',
    id_author:           1,
    created_at:          '2025-01-12T08:00:00Z',
    updated_at:          '2025-01-12T08:00:00Z',
  },
  {
    id:                  13,
    nombres:             'Jorge',
    apellidos:           'Mamani Quispe',
    vocativo:            Vocativo.Sr,
    cargo:               'Gerente Municipal',
    correo:              'jmamani@miraflores.gob.pe',
    telefono:            '987 123 456',
    id_organizacion:     'org-003',
    organizacion_nombre: 'Municipalidad de Miraflores',
    id_author:           2,
    created_at:          '2025-02-01T08:00:00Z',
    updated_at:          '2025-02-01T08:00:00Z',
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
        c.apellidos.toLowerCase().includes(q) ||
        c.correo.toLowerCase().includes(q) ||
        c.cargo?.toLowerCase().includes(q) ||
        c.organizacion_nombre?.toLowerCase().includes(q)
    )
  }

  if (filtros?.id_organizacion) {
    resultado = resultado.filter(
      (c) => c.id_organizacion === filtros.id_organizacion
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
    throw { status: 409, message: 'El contacto ya se encuentra registrado.' }
  }

  const nuevo: Contacto = {
    id:                  Date.now(),
    nombres:             data.nombres!,
    apellidos:           data.apellidos!,
    vocativo:            data.vocativo,
    cargo:               data.cargo,
    correo:              data.correo!,
    correo2:             data.correo2,
    telefono:            data.telefono,
    comentarios:         data.comentarios,
    id_organizacion:     data.id_organizacion!,
    organizacion_nombre: data.organizacion_nombre,
    id_author:           1,
    created_at:          new Date().toISOString(),
    updated_at:          new Date().toISOString(),
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

  const actualizado = {
    ...MOCK_CONTACTOS[index],
    ...data,
    updated_at: new Date().toISOString(),
  }

  MOCK_CONTACTOS[index] = actualizado
  return actualizado
}