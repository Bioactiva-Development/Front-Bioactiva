import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificacionesPage from '@/app/(dashboard)/notificaciones/page'

const useNotificacionesProgramadas = jest.fn()
const useCrearRecordatorio = jest.fn()
const useCrearSeguimiento = jest.fn()
const useEditarSeguimiento = jest.fn()
const useLeads = jest.fn()
const usePerfil = jest.fn()
const mockMicrosoftCalendarPanel = jest.fn(() => <div data-testid="calendar-panel" />)
let mockUsuario = {
  id: 9,
  rol: 'Trabajador',
}

jest.mock('@/store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      usuario: mockUsuario,
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

jest.mock('@/components/modules/notificaciones/MicrosoftCalendarPanel', () => ({
  MicrosoftCalendarPanel: (props: unknown) => mockMicrosoftCalendarPanel(props),
}))

describe('NotificacionesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsuario = {
      id: 9,
      rol: 'Trabajador',
    }
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

  it('filters notification history by the authenticated user regardless of role', () => {
    mockUsuario = {
      id: 11,
      rol: 'Administrador',
    }

    render(<NotificacionesPage />)

    expect(useNotificacionesProgramadas).toHaveBeenCalledWith({
      estado: 'PROGRAMADA',
      idResponsable: 11,
      page: 1,
      limit: 6,
    })
    expect(useNotificacionesProgramadas).toHaveBeenCalledWith({
      estado: 'VENCIDA',
      idResponsable: 11,
      page: 1,
      limit: 6,
    })
  })

  it('passes the authenticated user as responsible filter to calendar', async () => {
    const user = userEvent.setup()
    mockUsuario = {
      id: 11,
      rol: 'Administrador',
    }

    render(<NotificacionesPage />)
    await user.click(screen.getByRole('button', { name: 'Calendario' }))

    expect(mockMicrosoftCalendarPanel).toHaveBeenCalledWith(
      expect.objectContaining({ idResponsable: 11 })
    )
  })

  it('shows total counter for scheduled history', () => {
    useNotificacionesProgramadas
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: { page: 1, limit: 6, total: 5, totalPages: 1 },
        },
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: {
          data: [],
          meta: { page: 1, limit: 6, total: 7, totalPages: 2 },
        },
        isLoading: false,
      })

    render(<NotificacionesPage />)

    expect(screen.getByText('5 programadas')).toBeInTheDocument()
  })
})
