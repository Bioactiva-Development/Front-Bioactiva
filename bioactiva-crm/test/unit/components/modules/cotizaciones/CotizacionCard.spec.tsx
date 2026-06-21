import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CotizacionCard } from '@/components/modules/cotizaciones/CotizacionCard'
import { Cotizacion } from '@/types/cotizacion.types'
import { EstadoCot, TipoMoneda } from '@/types/enums'

const mockRouterPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: jest.fn(),
  useSearchParams: () => new URLSearchParams(),
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
  nombre_remitente: 'Luis Torres',
  id_author: 1,
  created_at: '2025-03-01T00:00:00Z',
  updated_at: '2025-03-01T00:00:00Z',
  lead_codigo: 'LEAD-001',
  periodo: 'Q1 2025',
  contacto_nombre: 'Juan Pérez',
  organizacion_nombre: 'Empresa SAC',
}

const renderCard = (cotizacion: Cotizacion) =>
  render(
    <table>
      <tbody>
        <CotizacionCard cotizacion={cotizacion} />
      </tbody>
    </table>
  )

describe('modules/cotizaciones/CotizacionCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders codigo', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('COT-001').length).toBeGreaterThan(0)
  })

  it('does not render the lead identifier', () => {
    renderCard(baseCotizacion)
    expect(screen.queryByText('LEAD-001')).not.toBeInTheDocument()
  })

  it('renders periodo', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Q1 2025').length).toBeGreaterThan(0)
  })

  it('renders contacto_nombre', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0)
  })

  it('renders organizacion_nombre', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Empresa SAC').length).toBeGreaterThan(0)
  })

  it('renders nombre_servicio', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Consultoría I+D').length).toBeGreaterThan(0)
  })

  it('formats monto with S/ symbol for Soles', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText(/S\/ 15,000/).length).toBeGreaterThan(0)
  })

  it('formats monto with $ symbol for Dolares', () => {
    const dolares: Cotizacion = { ...baseCotizacion, tipo: TipoMoneda.Dolares }
    renderCard(dolares)
    expect(screen.getAllByText(/\$ 15,000/).length).toBeGreaterThan(0)
  })

  it('renders estado badge', () => {
    renderCard(baseCotizacion)
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
  })

  it('renders Ver detalle as the only available action', () => {
    renderCard(baseCotizacion)
    expect(screen.getByTitle('Ver detalle')).toBeInTheDocument()
    expect(screen.queryByTitle('Marcar como enviada')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('does not render a print action', () => {
    renderCard(baseCotizacion)
    expect(screen.queryByTitle('Imprimir')).not.toBeInTheDocument()
  })

  it('opens the quotation detail from the action button', async () => {
    renderCard(baseCotizacion)
    await userEvent.click(screen.getByTitle('Ver detalle'))
    expect(mockRouterPush).toHaveBeenCalledWith('/cotizaciones/1')
  })

  it('calls router.push when row is clicked', async () => {
    renderCard(baseCotizacion)
    const row = screen.getAllByText('COT-001')[0].closest('tr')
    expect(row).toBeInTheDocument()
    if (row) {
      await userEvent.click(row)
      expect(mockRouterPush).toHaveBeenCalledWith('/cotizaciones/1')
    }
  })

})
