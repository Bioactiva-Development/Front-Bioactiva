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
    expect(screen.getAllByText('Todas').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Enviada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Aceptada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rechazada').length).toBeGreaterThan(0)
  })

  it('Todas tab is active when filtros.estado is undefined', () => {
    render(<CotizacionFiltros {...defaultProps} />)
    const btns = screen.getAllByText('Todas')
    expect(btns[0].className).toContain('bg-emerald-50')
  })

  it('Pendiente tab is active when filtros.estado is EstadoCot.Pendiente', () => {
    const filtros: FiltrosType = { ...baseFiltros, estado: EstadoCot.Pendiente }
    render(<CotizacionFiltros {...defaultProps} filtros={filtros} />)
    const btns = screen.getAllByText('Pendiente')
    expect(btns[0].className).toContain('bg-gray-100')
  })

  it('clicking Pendiente tab calls onChange with that estado and page:1', async () => {
    const onChange = jest.fn()
    render(<CotizacionFiltros {...defaultProps} onChange={onChange} />)
    await userEvent.click(screen.getAllByText('Pendiente')[0])
    expect(onChange).toHaveBeenCalledWith({
      ...baseFiltros,
      estado: EstadoCot.Pendiente,
      page: 1,
    })
  })

  it('clicking Enviada tab calls onChange with Enviada and page:1', async () => {
    const onChange = jest.fn()
    render(<CotizacionFiltros {...defaultProps} onChange={onChange} />)
    await userEvent.click(screen.getAllByText('Enviada')[0])
    expect(onChange).toHaveBeenCalledWith({
      ...baseFiltros,
      estado: EstadoCot.Enviada,
      page: 1,
    })
  })

  it('renders search input with placeholder Buscar por código, contacto, servicio...', () => {
    render(<CotizacionFiltros {...defaultProps} />)
    expect(screen.getByPlaceholderText('Buscar por código, contacto, servicio...')).toBeInTheDocument()
  })

  it('shows clear X button when search is not empty', () => {
    const filtros: FiltrosType = { ...baseFiltros, search: 'test' }
    render(<CotizacionFiltros {...defaultProps} filtros={filtros} />)
    expect(screen.getByTestId('icon-x')).toBeInTheDocument()
  })

  it('hidden clear X button when search is empty', () => {
    render(<CotizacionFiltros {...defaultProps} filtros={baseFiltros} />)
    expect(screen.queryByTestId('icon-x')).not.toBeInTheDocument()
  })

  it('clicking clear X clears search input value', async () => {
    const filtros: FiltrosType = { ...baseFiltros, search: 'test' }
    render(<CotizacionFiltros {...defaultProps} filtros={filtros} />)
    const input = screen.getByPlaceholderText('Buscar por código, contacto, servicio...') as HTMLInputElement
    expect(input.value).toBe('test')
    await userEvent.click(screen.getByTestId('icon-x').closest('button')!)
    expect(input.value).toBe('')
  })

  it('shows Loader2 when isLoading is true and search is not empty', () => {
    const filtros: FiltrosType = { ...baseFiltros, search: 'test' }
    render(<CotizacionFiltros {...defaultProps} filtros={filtros} isLoading={true} />)
    expect(screen.getByTestId('icon-loader')).toBeInTheDocument()
  })

  it('shows Search icon when isLoading is false', () => {
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
