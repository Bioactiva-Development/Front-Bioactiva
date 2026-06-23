import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionDetalle } from '@/components/modules/cotizaciones/CotizacionDetalle'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

const mockRouterPush = jest.fn()
const mockEnviar = jest.fn()
const mockAceptar = jest.fn()
const mockRechazar = jest.fn()
const mockGetErrorMessage = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))

jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useEnviarCotizacion: () => ({ mutateAsync: mockEnviar, isPending: false }),
  useAceptarCotizacion: () => ({ mutateAsync: mockAceptar, isPending: false }),
  useRechazarCotizacion: () => ({ mutateAsync: mockRechazar, isPending: false }),
}))

jest.mock('@/lib/utils/error.utils', () => ({
  getErrorMessage: (...args: unknown[]) => mockGetErrorMessage(...args),
}))

jest.mock('@/lib/constants/routes', () => ({
  ROUTES: { cotizaciones: '/cotizaciones' },
}))

jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  Pencil: () => <div data-testid="icon-pencil" />,
  ExternalLink: () => <div data-testid="icon-external-link" />,
  Send: () => <div data-testid="icon-send" />,
  CheckCircle2: () => <div data-testid="icon-check-circle" />,
  XCircle: () => <div data-testid="icon-x-circle" />,
  Loader2: () => <div data-testid="icon-loader" />,
  DollarSign: () => <div data-testid="icon-dollar" />,
  Building2: () => <div data-testid="icon-building" />,
}))

const baseCotizacion: Cotizacion = {
  id: 1,
  codigo: 'COT-001',
  id_lead: 1,
  id_remitente: 1,
  fecha_cot: '2025-03-01',
  dirigido: 'Juan Pérez',
  nombre_servicio: 'Consultoría I+D',
  monto: 15000,
  tipo: TipoMoneda.Soles,
  estado: EstadoCot.Pendiente,
  id_author: 1,
  created_at: '2025-03-01T00:00:00Z',
  updated_at: '2025-03-01T00:00:00Z',
  nombre_remitente: 'Luis Torres',
}

describe('modules/cotizaciones/CotizacionDetalle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header with codigo "COT-001"', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getAllByText('COT-001').length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Ver lead" button', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getByText('Ver lead')).toBeInTheDocument()
  })

  it('renders nombre_servicio', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getAllByText('Consultoría I+D').length).toBeGreaterThanOrEqual(1)
  })

  it('renders formatted monto with S/ symbol', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getAllByText(/S\/ 15,000/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders formatted fecha', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    const formatted = new Date('2025-03-01').toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    expect(screen.getAllByText(formatted).length).toBeGreaterThanOrEqual(1)
  })

  it('renders estado badge (Pendiente)', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Volver button', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getByText('Volver')).toBeInTheDocument()
  })

  it('does not render a print action', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.queryByText('Imprimir')).not.toBeInTheDocument()
  })

  it('shows Editar button when estado is not terminal', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('hides Editar button when estado is Aceptada', () => {
    const aceptada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Aceptada }
    render(<CotizacionDetalle cotizacion={aceptada} onEditar={jest.fn()} />)
    expect(screen.queryByText('Editar')).not.toBeInTheDocument()
  })

  it('shows Enviar button when estado is Pendiente', () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    expect(screen.getByText('Marcar como enviada')).toBeInTheDocument()
    expect(screen.queryByText('Aceptar')).not.toBeInTheDocument()
    expect(screen.queryByText('Rechazar')).not.toBeInTheDocument()
  })

  it('shows only Aceptar and Rechazar when estado is Enviada', () => {
    const enviada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Enviada }
    render(<CotizacionDetalle cotizacion={enviada} onEditar={jest.fn()} />)
    expect(screen.queryByText('Marcar como enviada')).not.toBeInTheDocument()
    expect(screen.getByText('Aceptar')).toBeInTheDocument()
    expect(screen.getByText('Rechazar')).toBeInTheDocument()
  })

  it('does not show lifecycle actions for Rechazada', () => {
    const rechazada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Rechazada }
    render(<CotizacionDetalle cotizacion={rechazada} onEditar={jest.fn()} />)
    expect(screen.queryByText('Marcar como enviada')).not.toBeInTheDocument()
    expect(screen.queryByText('Aceptar')).not.toBeInTheDocument()
    expect(screen.queryByText('Rechazar')).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Esta cotización está en estado terminal y no puede modificarse.'
      )
    ).toBeInTheDocument()
  })

  it('clicking Enviar calls enviar mutateAsync', async () => {
    mockEnviar.mockResolvedValue(undefined)
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    await userEvent.click(screen.getByText('Marcar como enviada'))
    expect(mockEnviar).toHaveBeenCalledWith(1)
  })

  it('clicking Aceptar calls aceptar mutateAsync', async () => {
    mockAceptar.mockResolvedValue(undefined)
    const enviada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Enviada }
    render(<CotizacionDetalle cotizacion={enviada} onEditar={jest.fn()} />)
    await userEvent.click(screen.getByText('Aceptar'))
    expect(mockAceptar).toHaveBeenCalledWith(1)
  })

  it('clicking Rechazar calls rechazar mutateAsync', async () => {
    mockRechazar.mockResolvedValue(undefined)
    const enviada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Enviada }
    render(<CotizacionDetalle cotizacion={enviada} onEditar={jest.fn()} />)
    await userEvent.click(screen.getByText('Rechazar'))
    expect(mockRechazar).toHaveBeenCalledWith(1)
  })

  it('clicking Volver calls router.push with ROUTES.cotizaciones', async () => {
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    await userEvent.click(screen.getByText('Volver'))
    expect(mockRouterPush).toHaveBeenCalledWith('/cotizaciones')
  })

  it('clicking Editar calls onEditar prop', async () => {
    const onEditar = jest.fn()
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={onEditar} />)
    await userEvent.click(screen.getByText('Editar'))
    expect(onEditar).toHaveBeenCalled()
  })

  it('shows error banner when action fails (getErrorMessage returns message)', async () => {
    const errorMsg = 'Error de prueba'
    mockGetErrorMessage.mockReturnValue(errorMsg)
    mockEnviar.mockRejectedValue(new Error('fail'))
    render(<CotizacionDetalle cotizacion={baseCotizacion} onEditar={jest.fn()} />)
    await userEvent.click(screen.getByText('Marcar como enviada'))
    expect(await screen.findByText(errorMsg)).toBeInTheDocument()
  })
})
