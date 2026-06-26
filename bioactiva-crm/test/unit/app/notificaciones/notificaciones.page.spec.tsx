import { render } from '@testing-library/react'
import NotificacionesPage from '@/app/(dashboard)/notificaciones/page'

const useNotificacionesProgramadas = jest.fn()
const useCrearRecordatorio = jest.fn()
const useCrearSeguimiento = jest.fn()
const useEditarSeguimiento = jest.fn()
const useLeads = jest.fn()
const usePerfil = jest.fn()

jest.mock('@/store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      usuario: {
        id: 9,
        rol: 'Trabajador',
      },
    }),
}))

jest.mock('@/hooks/notificaciones/useNotificaciones', () => ({
  useNotificacionesProgramadas: (...args: unknown[]) =>
    useNotificacionesProgramadas(...args),
  useCrearRecordatorio: () => useCrearRecordatorio(),
  useCrearSeguimiento: () => useCrearSeguimiento(),
  useEditarSeguimiento: () => useEditarSeguimiento(),
}))

jest.mock('@/hooks/pipeline/useLeads', () => ({
  useLeads: (...args: unknown[]) => useLeads(...args),
}))

jest.mock('@/hooks/perfil/usePerfil', () => ({
  usePerfil: () => usePerfil(),
}))

describe('NotificacionesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useNotificacionesProgramadas.mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, limit: 6, total: 0, totalPages: 1 },
      },
      isLoading: false,
    })
    useCrearRecordatorio.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })
    useCrearSeguimiento.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })
    useEditarSeguimiento.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })
    useLeads.mockReturnValue({ data: { data: [] } })
    usePerfil.mockReturnValue({
      integraciones: [],
      integracionInfo: null,
      isLoadingIntegracion: false,
      conectarMicrosoft: jest.fn(),
      desconectarMicrosoft: jest.fn(),
    })
  })

  it('paginates scheduled and expired history in groups of 6 per RF-0054', () => {
    render(<NotificacionesPage />)

    expect(useNotificacionesProgramadas).toHaveBeenCalledWith({
      estado: 'PROGRAMADA',
      idResponsable: 9,
      page: 1,
      limit: 6,
    })
    expect(useNotificacionesProgramadas).toHaveBeenCalledWith({
      estado: 'VENCIDA',
      idResponsable: 9,
      page: 1,
      limit: 6,
    })
  })
})
