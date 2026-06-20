import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionFiltros } from '@/components/modules/cotizaciones/CotizacionFiltros'
import { CotizacionFiltros as FiltrosType } from '@/types/cotizacion.types'
import { EstadoCot } from '@/types/enums'

// El buscador de organización se prueba por separado; aquí se sustituye por un
// stub que expone onSelect para verificar el mapeo a id_org.
jest.mock('@/components/ui/OrgBuscador/OrgBuscador', () => ({
  OrgBuscador: ({
    value,
    onSelect,
  }: {
    value?: string
    onSelect: (idOrg: string | undefined) => void
  }) => (
    <button data-testid="org-buscador" onClick={() => onSelect('org-1')}>
      org:{value ?? 'none'}
    </button>
  ),
}))

const baseFiltros: FiltrosType = {}

const defaultProps = {
  filtros: baseFiltros,
  onChange: jest.fn(),
}

describe('modules/cotizaciones/CotizacionFiltros', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all 5 tab buttons', () => {
    render(<CotizacionFiltros {...defaultProps} />)
    expect(screen.getByText('Todas')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('Enviada')).toBeInTheDocument()
    expect(screen.getByText('Aceptada')).toBeInTheDocument()
    expect(screen.getByText('Rechazada')).toBeInTheDocument()
  })

  it('Todas tab is active when filtros.estado is undefined', () => {
    render(<CotizacionFiltros {...defaultProps} />)
    const btn = screen.getByText('Todas')
    expect(btn.className).toContain('bg-emerald-50')
  })

  it('Pendiente tab is active when filtros.estado is EstadoCot.Pendiente', () => {
    const filtros: FiltrosType = { ...baseFiltros, estado: EstadoCot.Pendiente }
    render(<CotizacionFiltros {...defaultProps} filtros={filtros} />)
    const btn = screen.getByText('Pendiente')
    expect(btn.className).toContain('bg-gray-100')
  })

  it('clicking Pendiente tab calls onChange with that estado and page:1', async () => {
    const onChange = jest.fn()
    render(<CotizacionFiltros {...defaultProps} onChange={onChange} />)
    await userEvent.click(screen.getByText('Pendiente'))
    expect(onChange).toHaveBeenCalledWith({
      ...baseFiltros,
      estado: EstadoCot.Pendiente,
      page: 1,
    })
  })

  it('clicking Enviada tab calls onChange with Enviada and page:1', async () => {
    const onChange = jest.fn()
    render(<CotizacionFiltros {...defaultProps} onChange={onChange} />)
    await userEvent.click(screen.getByText('Enviada'))
    expect(onChange).toHaveBeenCalledWith({
      ...baseFiltros,
      estado: EstadoCot.Enviada,
      page: 1,
    })
  })

  it('renders the organization buscador', () => {
    render(<CotizacionFiltros {...defaultProps} />)
    expect(screen.getByTestId('org-buscador')).toBeInTheDocument()
  })

  it('selecting an organization calls onChange with id_org and page:1', async () => {
    const onChange = jest.fn()
    render(<CotizacionFiltros {...defaultProps} onChange={onChange} />)
    await userEvent.click(screen.getByTestId('org-buscador'))
    expect(onChange).toHaveBeenCalledWith({
      ...baseFiltros,
      id_org: 'org-1',
      page: 1,
    })
  })
})
