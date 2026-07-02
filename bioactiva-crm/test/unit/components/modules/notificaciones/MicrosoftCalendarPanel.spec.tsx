import { render, screen } from '@testing-library/react'
import { MicrosoftCalendarPanel } from '@/components/modules/notificaciones/MicrosoftCalendarPanel'

const useActividadesCalendario = jest.fn()
const useCrearEventoCalendario = jest.fn()

jest.mock('@/hooks/pipeline/useActividades', () => ({
  useActividadesCalendario: (...args: unknown[]) =>
    useActividadesCalendario(...args),
  useCrearEventoCalendario: (...args: unknown[]) =>
    useCrearEventoCalendario(...args),
}))

const disconnectedMessage =
  'Conexión con Microsoft no activa, inicie sesión desde su perfil'

describe('modules/notificaciones/MicrosoftCalendarPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useActividadesCalendario.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })
    useCrearEventoCalendario.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    })
  })

  it('shows the Microsoft inactive message when the account is not linked', () => {
    render(
      <MicrosoftCalendarPanel
        leads={[]}
        integraciones={{
          teams: { tipo: 'microsoft_teams', conectado: false },
          outlook: { tipo: 'microsoft_outlook', conectado: false },
        }}
        integracionInfo={null}
        isLoadingIntegracion={false}
        onDisconnect={jest.fn()}
      />
    )

    expect(screen.getByText(disconnectedMessage)).toBeInTheDocument()
  })

  it('does not show the inactive message before the integration status is loaded', () => {
    render(
      <MicrosoftCalendarPanel
        leads={[]}
        integraciones={null}
        integracionInfo={null}
        isLoadingIntegracion={false}
        onDisconnect={jest.fn()}
      />
    )

    expect(screen.queryByText(disconnectedMessage)).not.toBeInTheDocument()
  })
})
