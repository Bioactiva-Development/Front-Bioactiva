import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionCard } from '@/components/modules/cotizaciones/CotizacionCard'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

const mockRouterPush = jest.fn()
const mockEnviar = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/hooks/cotizaciones/useCotizaciones', () => ({
  useEnviarCotizacion: () => ({ mutateAsync: mockEnviar, isPending: false }),
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
  lead_codigo: 'LEAD-001',
  periodo: 'Q1 2025',
  organizacion_nombre: 'Empresa SAC',
}

describe('modules/cotizaciones/CotizacionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders codigo', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('COT-001')).toBeInTheDocument()
  })

  it('renders lead_codigo', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('LEAD-001')).toBeInTheDocument()
  })

  it('renders periodo', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('Q1 2025')).toBeInTheDocument()
  })

  it('renders dirigido', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('renders organizacion_nombre', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('Empresa SAC')).toBeInTheDocument()
  })

  it('renders nombre_servicio', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('Consultoría I+D')).toBeInTheDocument()
  })

  it('formats monto with S/ symbol for Soles', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText(/S\/ 15,000/)).toBeInTheDocument()
  })

  it('formats monto with $ symbol for Dolares', () => {
    const dolares: Cotizacion = { ...baseCotizacion, tipo: TipoMoneda.Dolares }
    render(<CotizacionCard cotizacion={dolares} />)
    expect(screen.getByText(/\$ 15,000/)).toBeInTheDocument()
  })

  it('renders estado badge', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('renders send button for Pendiente estado', () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    expect(screen.getByTitle('Marcar como enviada')).toBeInTheDocument()
  })

  it('hides send button for non-Pendiente estado', () => {
    const enviada: Cotizacion = { ...baseCotizacion, estado: EstadoCot.Enviada }
    render(<CotizacionCard cotizacion={enviada} />)
    expect(screen.queryByTitle('Marcar como enviada')).not.toBeInTheDocument()
  })

  it('calls enviar when send button is clicked', async () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    await userEvent.click(screen.getByTitle('Marcar como enviada'))
    expect(mockEnviar).toHaveBeenCalledWith(1)
  })

  it('calls router.push when row is clicked', async () => {
    render(<CotizacionCard cotizacion={baseCotizacion} />)
    const row = screen.getByText('COT-001').closest('tr')
    expect(row).toBeInTheDocument()
    if (row) {
      await userEvent.click(row)
      expect(mockRouterPush).toHaveBeenCalledWith('/cotizaciones/1')
    }
  })

  it('renders lead id fallback when lead_codigo is missing', () => {
    const sinCodigo: Cotizacion = { ...baseCotizacion, lead_codigo: undefined }
    render(<CotizacionCard cotizacion={sinCodigo} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
  })
})
